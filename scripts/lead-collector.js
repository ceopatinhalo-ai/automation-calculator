/**
 * AutoFlow Tech — Real Lead Dispatcher (Zero Silent Mocking)
 * Project: 12-affiliates
 * 
 * Features:
 * 1. Transmits real captured email leads directly to Webhook / CRM endpoint.
 * 2. Automatic routing to Email Branching Flows:
 *    - 'forex': Forex & Prop Firm Algorithmic Traders (Flow 1)
 *    - 'saas': SaaS Solopreneurs & Cloud VPS Automation (Flow 2)
 * 3. Offline-First reliability: LocalStorage queue with automatic online recovery flush.
 * 4. Zero hardcoded fake metrics.
 */

const AUTOFLOW_LEAD_ENDPOINT = (typeof window !== 'undefined' && window.AUTOFLOW_CONFIG?.leadEndpoint) 
  || 'https://formsubmit.co/ajax/b0ynghe0lx@gmail.com';

function determineFlowType(source = '', path = '') {
  const src = (source || '').toLowerCase();
  if (src.includes('forex') || src.includes('propfirm') || src.includes('gold') || src.includes('pip') || src.includes('trade')) {
    return 'forex';
  }
  if (src.includes('vps') || src.includes('zapier') || src.includes('make') || src.includes('saas') || src.includes('cloud') || src.includes('email') || src.includes('brevo')) {
    return 'saas';
  }
  const pth = (path || '').toLowerCase();
  if (pth.includes('forex') || pth.includes('propfirm') || pth.includes('gold') || pth.includes('pip') || pth.includes('trade')) {
    return 'forex';
  }
  return 'saas';
}

async function dispatchLeadToBackend(email, source, metadata = {}) {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    console.warn('[AutoFlow Lead] Invalid email provided:', email);
    return false;
  }

  const cleanEmail = email.trim().toLowerCase();
  const currentPath = (typeof window !== 'undefined' && window.location?.pathname) ? window.location.pathname : '';
  const currentReferrer = (typeof document !== 'undefined' && document.referrer) ? document.referrer : 'direct';
  const flowType = metadata.flow_type || determineFlowType(source, currentPath);

  const payload = {
    _subject: `[AutoFlow Lead][${flowType.toUpperCase()}] New Lead from ${source}: ${cleanEmail}`,
    email: cleanEmail,
    source: source || 'unknown_tool',
    flow_type: flowType,
    timestamp: new Date().toISOString(),
    referrer: currentReferrer,
    path: currentPath,
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

    if (res && res.ok) {
      console.log(`[AutoFlow Lead] Lead successfully transmitted: ${cleanEmail} (Flow: ${flowType})`);
      return true;
    } else {
      const status = res ? res.status : 'unknown';
      console.warn(`[AutoFlow Lead] Endpoint returned status ${status}, saving to offline queue.`);
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
    const storage = (typeof localStorage !== 'undefined') ? localStorage : (typeof window !== 'undefined' ? window.localStorage : null);
    if (!storage) return;
    const queue = JSON.parse(storage.getItem('autoflow_pending_lead_queue') || '[]');
    queue.push(payload);
    storage.setItem('autoflow_pending_lead_queue', JSON.stringify(queue));
    console.log(`[AutoFlow Lead] Enqueued lead offline. Queue size: ${queue.length}`);
  } catch (e) {
    console.error('[AutoFlow Lead] Could not persist offline queue:', e);
  }
}

async function flushOfflineLeadsQueue() {
  const storage = (typeof localStorage !== 'undefined') ? localStorage : (typeof window !== 'undefined' ? window.localStorage : null);
  if (!storage) return 0;

  let queue = [];
  try {
    queue = JSON.parse(storage.getItem('autoflow_pending_lead_queue') || '[]');
  } catch (e) {
    return 0;
  }

  if (queue.length === 0) return 0;
  console.log(`[AutoFlow Lead] Flushing ${queue.length} offline leads...`);

  const unhandled = [];
  let successCount = 0;

  for (const item of queue) {
    try {
      const res = await fetch(AUTOFLOW_LEAD_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(item)
      });
      if (res && res.ok) {
        successCount++;
      } else {
        unhandled.push(item);
      }
    } catch (err) {
      unhandled.push(item);
    }
  }

  try {
    storage.setItem('autoflow_pending_lead_queue', JSON.stringify(unhandled));
  } catch (e) {}

  console.log(`[AutoFlow Lead] Flushed ${successCount} leads. Remaining in queue: ${unhandled.length}`);
  return successCount;
}

// Window global attachment & auto-online listener
if (typeof window !== 'undefined') {
  window.dispatchLeadToBackend = dispatchLeadToBackend;
  window.queueOfflineLead = queueOfflineLead;
  window.flushOfflineLeadsQueue = flushOfflineLeadsQueue;

  if (typeof window.addEventListener === 'function') {
    window.addEventListener('online', () => {
      console.log('[AutoFlow Lead] Internet connection restored. Triggering queue flush...');
      flushOfflineLeadsQueue();
    });
  }
}
