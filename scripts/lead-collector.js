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


// ============================================================================
// REAL-TIME PARTNER CLICK & BLUEPRINT DOWNLOAD TELEMETRY BEACON (v3.2.0)
// ============================================================================
const AUTOFLOW_PARTNER_DOMAINS = [
  'make.com', 'hostinger.com', 'exnesstrack.net', 'exness.com', 'zfx.com',
  'vantagemarkets.com', 'xm.com', 'icmarkets.com', 'roboforex.com', 'fbs.com',
  'hfm.com', 'binance.com', 'bybit.com', 'okx.com', 'bitget.com', 'gate.io',
  'mexc.com', 'kucoin.com', 'bingx.com', 'coinex.com', 'wise.com', 'remitly.com',
  'tradingview.com', 'affitor.com', 'getrewardful.com', 'brevo.com', 'play.ht',
  'heygen.com', 'elevenlabs.io', 'coursera.org'
];

const AUTOFLOW_TG_BOT_ENDPOINT = (typeof window !== 'undefined' && window.AUTOFLOW_CONFIG?.telegramEndpoint)
  || 'https://api.telegram.org/bot8885668875:AAG3Yv0H0n2h8x0_76OW45hyhD6Y6n3fAsw/sendMessage';
const AUTOFLOW_TG_CHAT_ID = (typeof window !== 'undefined' && window.AUTOFLOW_CONFIG?.telegramChatId)
  || 634960898;

function isPartnerOrBlueprintHref(href = '') {
  if (!href || typeof href !== 'string') return false;
  const lower = href.toLowerCase();
  if (lower.includes('/blueprints/') || lower.endsWith('.json')) return true;
  return AUTOFLOW_PARTNER_DOMAINS.some(d => lower.includes(d));
}

function dispatchPartnerClickBeacon(href, label = '', metadata = {}) {
  if (!href) return false;
  const currentPath = (typeof window !== 'undefined' && window.location?.pathname) ? window.location.pathname : '';
  const searchParams = (typeof window !== 'undefined' && window.location?.search) ? window.location.search : '';
  const currentReferrer = (typeof document !== 'undefined' && document.referrer) ? document.referrer : 'direct';
  const flowType = determineFlowType(href + ' ' + label, currentPath);

  const eventRecord = {
    type: href.toLowerCase().includes('blueprint') || href.toLowerCase().endsWith('.json') ? 'BLUEPRINT_DOWNLOAD' : 'PARTNER_CLICK',
    href: href,
    label: (label || '').trim().slice(0, 120),
    flow_type: flowType,
    path: currentPath,
    query: searchParams,
    referrer: currentReferrer,
    timestamp: new Date().toISOString(),
    ...metadata
  };

  try {
    const storage = (typeof localStorage !== 'undefined') ? localStorage : (typeof window !== 'undefined' ? window.localStorage : null);
    if (storage) {
      const history = JSON.parse(storage.getItem('autoflow_partner_clicks') || '[]');
      history.push(eventRecord);
      storage.setItem('autoflow_partner_clicks', JSON.stringify(history.slice(-100)));
    }
  } catch (e) {}

  if (typeof navigator !== 'undefined' && typeof fetch === 'function') {
    const textMsg = [
      `🎯 [CLICK ĐỐI TÁC / BLUEPRINT MỚI!]`,
      `• Loại: ${eventRecord.type} (${flowType.toUpperCase()})`,
      `• Nhãn nút: ${eventRecord.label || 'N/A'}`,
      `• Đích: ${eventRecord.href}`,
      `• Trang nguồn: ${eventRecord.path}${eventRecord.query}`,
      `• Referrer: ${eventRecord.referrer}`,
      `• Thời gian: ${eventRecord.timestamp}`
    ].join('\n');

    try {
      fetch(AUTOFLOW_TG_BOT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: AUTOFLOW_TG_CHAT_ID,
          text: textMsg,
          disable_web_page_preview: true
        }),
        keepalive: true
      }).catch(() => {});
    } catch (e) {}
  }

  return eventRecord;
}

if (typeof window !== 'undefined') {
  window.dispatchPartnerClickBeacon = dispatchPartnerClickBeacon;
  window.isPartnerOrBlueprintHref = isPartnerOrBlueprintHref;
}

if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('click', function (evt) {
    try {
      let el = evt.target;
      while (el && el !== document && el.tagName !== 'A') {
        el = el.parentElement;
      }
      if (el && el.tagName === 'A') {
        const href = el.getAttribute('href') || el.href || '';
        if (isPartnerOrBlueprintHref(href)) {
          const label = el.innerText || el.textContent || el.getAttribute('aria-label') || 'Affiliate CTA';
          dispatchPartnerClickBeacon(href, label);
        }
      }
    } catch (e) {}
  }, { capture: true, passive: true });
}
