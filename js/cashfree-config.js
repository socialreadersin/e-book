/**
 * Cashfree Payment Gateway Configuration
 * Social Readers — Production Secure Payment Layer
 *
 * ⚠️ CLIENT-SAFE: Only public configuration is defined here.
 * The Cashfree Secret Key is NEVER placed in frontend code.
 * Payment orders and verification happen exclusively in Firebase Cloud Functions.
 */
(function () {
  const CASHFREE_CONFIG = {
    // ─── ENVIRONMENT ──────────────────────────────────────────────────────────
    // 'sandbox' for testing or 'production' for live payments
    environment: 'sandbox',

    // ─── APP ID (Client-Safe Public Identifier) ───────────────────────────────
    appId: (window.__CASHFREE_APP_ID__ || (window.firebaseConfig && window.firebaseConfig.cashfreeAppId) || 'CF_SANDBOX_APP'),

    // ─── SDK CDN URL ───────────────────────────────────────────────────────────
    sdkUrl: 'https://sdk.cashfree.com/js/v3/cashfree.js',

    // ─── 100% FREE CLOUDFLARE SERVERLESS ENDPOINTS ────────────────────────────
    createOrderFunctionUrl: (() => {
      if (typeof window !== 'undefined') {
        return '/api/create-order';
      }
      return '/api/create-order';
    })(),

    verifyPaymentFunctionUrl: (() => {
      if (typeof window !== 'undefined') {
        return '/api/verify-payment';
      }
      return '/api/verify-payment';
    })(),
  };

  window.CASHFREE_CONFIG = CASHFREE_CONFIG;

  window.CashfreeService = {
    isConfigured() {
      return Boolean(
        CASHFREE_CONFIG.appId &&
        !CASHFREE_CONFIG.appId.includes('PLACEHOLDER') &&
        !CASHFREE_CONFIG.appId.includes('[YOUR_')
      );
    },
    getEnvironment() {
      return CASHFREE_CONFIG.environment;
    },
    getAppId() {
      return CASHFREE_CONFIG.appId;
    },
    getCreateOrderUrl() {
      return CASHFREE_CONFIG.createOrderFunctionUrl;
    },
    getVerifyPaymentUrl() {
      return CASHFREE_CONFIG.verifyPaymentFunctionUrl;
    },

    /**
     * Load the Cashfree JS SDK dynamically
     */
    async loadSDK() {
      return new Promise((resolve, reject) => {
        if (window.Cashfree) {
          resolve(window.Cashfree);
          return;
        }
        const existing = document.querySelector(`script[src="${CASHFREE_CONFIG.sdkUrl}"]`);
        if (existing) {
          existing.addEventListener('load', () => resolve(window.Cashfree));
          existing.addEventListener('error', reject);
          return;
        }
        const script = document.createElement('script');
        script.src = CASHFREE_CONFIG.sdkUrl;
        script.async = true;
        script.onload = () => resolve(window.Cashfree);
        script.onerror = () => reject(new Error('Failed to load Cashfree SDK. Check internet connection or ad-blocker settings.'));
        document.head.appendChild(script);
      });
    },

    /**
     * Create a Cashfree payment order via Firebase Cloud Function
     * @param {Object} orderRequest - { bookId, format, buyerName, buyerEmail, userId? }
     * @returns {Promise<{ orderId, paymentSessionId, amount }>}
     */
    async createOrder(orderRequest) {
      let url = this.getCreateOrderUrl();
      const currentUser = window.SocialReadersAuth && window.SocialReadersAuth.getCurrentUser
        ? window.SocialReadersAuth.getCurrentUser()
        : null;

      const payload = {
        bookId: orderRequest.bookId,
        format: orderRequest.format || 'ebook',
        buyerName: orderRequest.buyerName || (currentUser && currentUser.name) || 'Customer',
        buyerEmail: orderRequest.buyerEmail || (currentUser && currentUser.email) || '',
        userId: (currentUser && currentUser.uid) || null,
        environment: CASHFREE_CONFIG.environment
      };

      let res;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        if (!url.startsWith('https://')) {
          url = 'https://e-book.ragavananbu2018.workers.dev/api/create-order';
          res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          throw err;
        }
      }

      // If relative URL returned 404/405/500, fallback to live worker endpoint
      if (!res.ok && !url.startsWith('https://')) {
        try {
          const fallbackUrl = 'https://e-book.ragavananbu2018.workers.dev/api/create-order';
          const fallbackRes = await fetch(fallbackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (fallbackRes.ok) {
            return await fallbackRes.json();
          }
        } catch (_) {}
      }

      if (!res.ok) {
        let errMsg = `Order creation failed (HTTP ${res.status})`;
        try {
          const errBody = await res.json();
          errMsg = errBody.error || errBody.message || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      if (!data.paymentSessionId) {
        throw new Error('Invalid order response from payment server. Please try again.');
      }
      return data;
    },

    /**
     * Verify payment status via Cloudflare Worker
     * @param {string} orderId - The Cashfree order ID
     * @returns {Promise<{ success: boolean, status: string, order?: Object }>}
     */
    async verifyPayment(orderId) {
      let url = this.getVerifyPaymentUrl();
      const payload = { orderId, environment: CASHFREE_CONFIG.environment };

      let res;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        if (!url.startsWith('https://')) {
          url = 'https://e-book.ragavananbu2018.workers.dev/api/verify-payment';
          res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          throw err;
        }
      }

      // If relative URL failed (e.g. 404/405), fallback to deployed live endpoint
      if (!res.ok && !url.startsWith('https://')) {
        try {
          const fallbackUrl = 'https://e-book.ragavananbu2018.workers.dev/api/verify-payment';
          const fallbackRes = await fetch(fallbackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (fallbackRes.ok) {
            return await fallbackRes.json();
          }
        } catch (_) {}
      }

      if (!res.ok) {
        return { success: false, status: 'FAILED' };
      }
      return await res.json();
    }
  };

  console.log(`💳 Cashfree Payment Service Ready [${CASHFREE_CONFIG.environment.toUpperCase()}]`);
})();
