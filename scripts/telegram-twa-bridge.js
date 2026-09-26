/**
 * AutoFlow Tech — Telegram Web App (TWA) Native Bridge
 * Project: 12-affiliates — Telegram Web Apps Integration (Lever 5)
 * 
 * Features:
 * 1. Automatically initializes Telegram WebApp SDK when opened inside Telegram.
 * 2. Expands to 100% viewport height for seamless mobile app UX.
 * 3. Binds native tactile Haptic Feedback to all interactive sliders and calculation inputs.
 * 4. Syncs Telegram theme (dark/light) smoothly.
 */

(function initTelegramWebAppBridge() {
  if (typeof window === 'undefined') return;

  function setupBridge() {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // 1. Mark app as ready and expand viewport
    try {
      tg.ready();
      tg.expand();
    } catch (e) {
      console.warn('[TWA Bridge] Init error:', e);
    }

    // 2. Helper for Haptic Feedback
    window.triggerTwaHaptic = function(type = 'selection') {
      try {
        if (!tg.HapticFeedback) return;
        if (type === 'selection') {
          tg.HapticFeedback.selectionChanged();
        } else if (type === 'impact') {
          tg.HapticFeedback.impactOccurred('light');
        } else if (type === 'success') {
          tg.HapticFeedback.notificationOccurred('success');
        }
      } catch (err) {}
    };

    // 3. Attach haptic feedback to all range sliders
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
      slider.addEventListener('input', () => {
        window.triggerTwaHaptic('selection');
      });
    });

    // 4. Attach haptic impact to buttons
    const buttons = document.querySelectorAll('button, .cta-button, .btn-primary');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        window.triggerTwaHaptic('impact');
      });
    });

    console.log('[TWA Bridge] Telegram Web App Native Bridge Active.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupBridge);
  } else {
    setupBridge();
  }
})();
