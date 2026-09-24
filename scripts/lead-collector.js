/**
 * AutoFlow Tech — Real Lead Dispatcher (Zero Silent Mocking)
 * Project: 12-affiliates
 * 
 * Features:
 * 1. Transmits real captured email leads directly to Founder's endpoint (formsubmit.co / Make.com webhook).
 * 2. Provides honest network feedback: resolves true only on HTTP 200, handles offline retries.
 * 3. Zero hardcoded fake metrics.
 */

const AUTOFLOW_LEAD_ENDPOINT = window.AUTOFLOW_CONFIG?.leadEndpoint || 'https://formsubmit.co/ajax/b0ynghe0lx@gmail.com';

async function dispatchLeadToBackend(email, source, metadata = {}) {
  if (!email || !email.includes('@')) {
    console.warn('[AutoFlow Lead] Invalid email provided:', email);
    return false;
  }

  const payload = {
    _subject: `[AutoFlow Lead] New Lead from ${source}: ${email.trim()}`,
    email: email.trim().toLowerCase(),
    source: source || 'unknown_tool',
    timestamp: new Date().toISOString(),
    referrer: document.referrer || 'direct',
    path: window.location.pathname,
    ...metadata
  };

  try {
    const res = await fetch(AUTOFLOW_LEAD_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log(`[AutoFlow Lead] Lead successfully transmitted for ${email} -> ${source}`);
      return true;
    } else {
      console.warn(`[AutoFlow Lead] Endpoint returned status ${res.status}`);
      queueOfflineLead(payload);
      return false;
    }
  } catch (err) {
    console.warn('[AutoFlow Lead] Network error transmitting lead, queueing for retry:', err);
    queueOfflineLead(payload);
    return false;
  }
}

function queueOfflineLead(payload) {
  try {
    const queue = JSON.parse(localStorage.getItem('autoflow_pending_lead_queue') || '[]');
    queue.push(payload);
    localStorage.setItem('autoflow_pending_lead_queue', JSON.stringify(queue));
  } catch (e) {
    console.error('[AutoFlow Lead] Could not persist offline queue:', e);
  }
}

// Window global attachment
window.dispatchLeadToBackend = dispatchLeadToBackend;
