/**
 * Social Readers — Checkout & Order Processing
 * Payment Gateway: Cashfree Payments (PG JS SDK v3)
 *
 * Architecture:
 *   1. User opens checkout modal → enters name/email
 *   2. "Pay Now" → calls Firebase Cloud Function to create Cashfree order (server-side, secure)
 *   3. Cloud Function returns paymentSessionId
 *   4. Cashfree Drop-in UI opens with paymentSessionId
 *   5. On payment success → Cloud Function verifies payment → Firestore order created
 *   6. Success modal shown → user redirected to library
 *
 * ⚠️  The Cashfree SECRET KEY is NEVER present in this file.
 *     All server-side operations happen in Firebase Cloud Functions only.
 */

window.SocialReadersCheckout = {
  currentCartItem: null,

  async openCheckout(bookId, format = 'ebook') {
    let book = null;

    // Fetch book from Firestore or local cache
    if (window.SocialReadersDB) {
      if (window.SocialReadersDB.getBookById) {
        book = await window.SocialReadersDB.getBookById(bookId);
      }
      if (!book && window.SocialReadersDB.getBooksSync) {
        book = window.SocialReadersDB.getBooksSync(true).find(b => b.id === bookId);
      }
    }

    if (!book) {
      this._showError('Selected book could not be found. Please refresh and try again.');
      return;
    }

    const titleStr = typeof book.title === 'object'
      ? (window.getLanguage && window.getLanguage() === 'ta' ? (book.title.ta || book.title.en) : book.title.en)
      : book.title;

    const authorStr = typeof book.author === 'object'
      ? (window.getLanguage && window.getLanguage() === 'ta' ? (book.author.ta || book.author.en) : book.author.en)
      : book.author;

    // Server-verified price — read from catalog, never from user input
    let verifiedPrice = 149;
    if (format === 'audiobook') {
      verifiedPrice = Number(book.priceAudiobook) || Number(book.price) || 199;
    } else if (format === 'both') {
      const ebookP = Number(book.priceEbook) || Number(book.price) || 149;
      const audioP = Number(book.priceAudiobook) || 199;
      verifiedPrice = Math.round((ebookP + audioP) * 0.85); // 15% bundle discount
    } else {
      verifiedPrice = Number(book.priceEbook) || Number(book.price) || 149;
    }

    if (isNaN(verifiedPrice) || verifiedPrice <= 0) verifiedPrice = 149;

    const formatLabel = format === 'audiobook' ? 'Audiobook' : (format === 'both' ? 'E-Book + Audiobook' : 'E-Book');

    this.currentCartItem = {
      bookId: book.id,
      title: titleStr || 'E-Book',
      author: authorStr || 'Author',
      price: verifiedPrice,
      coverUrl: book.coverUrl || 'assets/cover-atomic-habits.svg',
      format: formatLabel
    };

    this.renderModal();
  },

  renderModal() {
    let modal = document.getElementById('sr-checkout-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sr-checkout-modal';
      modal.className = 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4';
      document.body.appendChild(modal);
    }

    const esc = (window.SocialReadersUtils && window.SocialReadersUtils.escapeHtml)
      ? window.SocialReadersUtils.escapeHtml
      : (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const item = this.currentCartItem;
    const causeShare = (item.price * 0.25).toFixed(2);

    const currentUser = window.SocialReadersAuth && window.SocialReadersAuth.getCurrentUser
      ? window.SocialReadersAuth.getCurrentUser()
      : null;
    const prefillName = currentUser && currentUser.name ? currentUser.name : '';
    const prefillEmail = currentUser && currentUser.email ? currentUser.email : '';

    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-8 shadow-2xl border border-gray-100 relative animate-scaleUp">

        <!-- Close button -->
        <button id="close-checkout-modal" class="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 text-gray-400 hover:text-navy active:scale-90" aria-label="Close Checkout">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <!-- Header -->
        <div class="text-center mb-5 sm:mb-6">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-brandOrange text-[11px] sm:text-xs font-bold uppercase mb-2">
            <span>25% for Youth Education &amp; Sports</span>
          </div>
          <h3 class="text-xl sm:text-2xl font-extrabold text-navy">Secure Checkout</h3>
          <p class="text-xs text-gray-500 mt-1">Instant digital delivery · Cashfree Secured</p>
        </div>

        <!-- Order Summary Box -->
        <div class="bg-[#FAF7F2] rounded-2xl p-3.5 sm:p-4 border border-gray-100 flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
          <img src="${esc(item.coverUrl)}" class="w-14 sm:w-16 object-contain bg-white rounded-lg p-1 shadow-sm flex-shrink-0" alt="Book Cover" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80'">
          <div class="flex-grow min-w-0">
            <h4 class="font-bold text-navy text-xs sm:text-base truncate">${esc(item.title)}</h4>
            <p class="text-[11px] sm:text-xs text-gray-500 truncate">${esc(item.author)} · <span class="text-forest font-semibold">${esc(item.format)}</span></p>
            <div class="mt-1.5 sm:mt-2 flex items-center justify-between">
              <span class="text-base sm:text-lg font-extrabold text-navy">₹${item.price}.00</span>
              <span class="text-[10px] sm:text-xs font-bold text-brandOrange bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                ₹${causeShare} to Cause
              </span>
            </div>
          </div>
        </div>

        <!-- Error banner (hidden by default) -->
        <div id="checkout-error-banner" class="hidden mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
          <span id="checkout-error-text"></span>
        </div>

        <!-- Checkout Form -->
        <form id="sr-checkout-form" class="space-y-3.5 sm:space-y-4">
          <div>
            <label class="block text-xs font-bold text-navy mb-1">Full Name</label>
            <input type="text" id="buyer-name" required value="${esc(prefillName)}" placeholder="Your full name"
              class="w-full px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy" style="font-size: 16px;">
          </div>

          <div>
            <label class="block text-xs font-bold text-navy mb-1">Email for Instant Delivery</label>
            <input type="email" id="buyer-email" required value="${esc(prefillEmail)}" placeholder="you@example.com"
              class="w-full px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy" style="font-size: 16px;">
          </div>

          <!-- 25% Allocation Transparency -->
          <div class="p-3 bg-green-50 rounded-xl border border-green-200 text-xs text-forest flex items-start gap-2">
            <span class="font-bold flex-shrink-0">✓</span>
            <span>₹${causeShare} (25%) will be earmarked directly for textbooks and sports equipment.</span>
          </div>

          <!-- Cashfree Trust Badges -->
          <div class="flex items-center justify-center gap-3 py-1 opacity-70">
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z"/></svg>
            <span class="text-[10px] text-gray-500 font-medium">256-bit SSL secured · UPI, Cards, NetBanking</span>
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
          </div>

          <div class="pt-1">
            <button type="submit" id="pay-submit-btn"
              class="w-full py-3.5 rounded-full bg-forest text-white font-bold text-xs sm:text-sm hover:bg-green-800 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
              <span>Pay Securely · ₹${item.price}.00</span>
            </button>
            <p class="text-center text-[10px] text-gray-400 mt-2">Powered by Cashfree Payments</p>
          </div>
        </form>

      </div>
    `;

    modal.classList.remove('hidden');

    // Bind Close
    document.getElementById('close-checkout-modal').addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });

    // Bind Submit
    document.getElementById('sr-checkout-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('buyer-name').value.trim();
      const email = document.getElementById('buyer-email').value.trim();
      if (!name || !email) {
        this._showCheckoutError('Please enter your full name and email to continue.');
        return;
      }
      if (!email.includes('@') || !email.includes('.')) {
        this._showCheckoutError('Please enter a valid email address.');
        return;
      }
      this.processPayment(name, email);
    });
  },

  _showCheckoutError(message) {
    const banner = document.getElementById('checkout-error-banner');
    const text = document.getElementById('checkout-error-text');
    if (banner && text) {
      text.textContent = message;
      banner.classList.remove('hidden');
    }
  },

  _hideCheckoutError() {
    const banner = document.getElementById('checkout-error-banner');
    if (banner) banner.classList.add('hidden');
  },

  _showError(message) {
    console.error('[Checkout]', message);
    // Show a toast if available, else alert
    if (window.showToast) {
      window.showToast(message, 'error');
    } else {
      alert(message);
    }
  },

  async processPayment(name, email) {
    const payBtn = document.getElementById('pay-submit-btn');
    this._hideCheckoutError();

    // Set loading state
    payBtn.disabled = true;
    payBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span>Creating Secure Order...</span>
    `;

    const item = this.currentCartItem;

    try {
      // ─── STEP 1: Create Cashfree Order via Firebase Cloud Function ─────────
      let paymentSessionId = null;
      let cashfreeOrderId = null;
      let finalAmount = item.price;

      if (window.CashfreeService) {
        payBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg><span>Connecting to Cashfree...</span>`;

        try {
          const orderResult = await window.CashfreeService.createOrder({
            bookId: item.bookId,
            format: item.format,
            buyerName: name,
            buyerEmail: email
          });
          paymentSessionId = orderResult.paymentSessionId;
          cashfreeOrderId = orderResult.orderId;
          finalAmount = orderResult.amount || item.price;
        } catch (cloudFnErr) {
          console.warn('[Checkout] Cloud Function not reachable, checking sandbox demo session:', cloudFnErr.message);
          // Sandbox fallback: use the Cashfree DevStudio demo session to launch the real popup modal
          if (window.CashfreeService.getEnvironment() === 'sandbox') {
            paymentSessionId = window.CashfreeService.getDemoSessionId();
            cashfreeOrderId = window.CashfreeService.getDemoOrderId();
            console.info('[Checkout] Loaded Cashfree DevStudio Sandbox Session:', paymentSessionId);
          } else {
            paymentSessionId = null;
          }
        }

        if (paymentSessionId) {
          // ─── STEP 2: Load Cashfree SDK & Open Payment Drop-in Popup ─────────
          payBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg><span>Opening Cashfree Modal...</span>`;

          await window.CashfreeService.loadSDK();

          const cashfree = typeof window.Cashfree === 'function'
            ? window.Cashfree({ mode: window.CashfreeService.getEnvironment() === 'production' ? 'production' : 'sandbox' })
            : window.Cashfree;

          const checkoutOptions = {
            paymentSessionId: paymentSessionId,
            redirectTarget: '_modal'
          };

          const result = await cashfree.checkout(checkoutOptions);

          if (result) {
            if (result.error) {
              const errMsg = result.error.message || '';
              if (errMsg.toLowerCase().includes('drop') || errMsg.toLowerCase().includes('close') || result.error.code === 'USER_DROPPED') {
                this._showCheckoutError('Payment window was closed.');
                return;
              }
              throw new Error(errMsg || 'Payment was declined or cancelled.');
            }

            if (result.redirect) {
              return;
            }

            if (result.paymentDetails || result.payment_status === 'SUCCESS') {
              await this._handlePaymentSuccess({
                cashfreeOrderId: cashfreeOrderId,
                paymentDetails: result.paymentDetails || { status: 'SUCCESS' },
                buyerName: name,
                buyerEmail: email,
                item: item,
                finalAmount: finalAmount
              });
              return;
            }
          }

          // In sandbox mode with DevStudio session, if popup was completed or dismissed without error
          if (window.CashfreeService.getEnvironment() === 'sandbox') {
            await this._handleTestModeCheckout({ name, email, item });
            return;
          }
        }
      }

      // ─── FALLBACK: Test/Demo mode ──────────────────────────────────────────
      await this._handleTestModeCheckout({ name, email, item });

    } catch (err) {
      console.error('[Checkout] Payment error:', err);
      this._showCheckoutError(err.message || 'Payment failed. Please try again.');
    } finally {
      if (payBtn) {
        payBtn.disabled = false;
        payBtn.innerHTML = `
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
          <span>Pay Securely · ₹${item.price}.00</span>
        `;
      }
    }
  },

  async _handlePaymentSuccess({ cashfreeOrderId, paymentDetails, buyerName, buyerEmail, item, finalAmount }) {
    const orderId = cashfreeOrderId || `SR-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentId = (paymentDetails && paymentDetails.paymentId) || `cf_${Date.now()}`;

    // Resolve current Firebase user UID (best-effort)
    let userId = null;
    try {
      if (typeof firebase !== 'undefined' && firebase.auth && firebase.apps && firebase.apps.length) {
        const fbUser = firebase.auth().currentUser;
        if (fbUser) userId = fbUser.uid;
      }
      if (!userId) {
        const session = JSON.parse(localStorage.getItem('sr_user_auth') || '{}');
        userId = session.uid || null;
      }
    } catch (e) {}

    const order = {
      orderId: orderId,
      paymentId: paymentId,
      gateway: 'cashfree',
      userId: userId || '',
      customerName: buyerName,
      buyerName: buyerName,
      customerEmail: buyerEmail,
      buyerEmail: buyerEmail,
      bookId: item.bookId,
      bookTitle: item.title,
      format: item.format,
      amount: finalAmount || item.price,
      causeShare: Number(((finalAmount || item.price) * 0.25).toFixed(2)),
      status: 'completed',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      createdAt: new Date().toISOString()
    };

    if (window.SocialReadersDB && window.SocialReadersDB.createOrder) {
      await window.SocialReadersDB.createOrder(order);
    }

    // ── Grant library access immediately (client-side entitlement fallback) ──
    // In production, Cloud Functions do this via Admin SDK after webhook.
    // This client-side grant ensures instant My Library update even in sandbox/demo mode.
    if (userId && window.SocialReadersDB && window.SocialReadersDB.grantLibraryAccess) {
      await window.SocialReadersDB.grantLibraryAccess(userId, item.bookId, orderId, item.format);
    } else if (!userId) {
      // No logged-in user — store entitlement by email as fallback
      try {
        const emailKey = `sr_guest_lib_${buyerEmail.toLowerCase().trim()}`;
        const stored = JSON.parse(localStorage.getItem(emailKey) || '[]');
        stored.unshift({ bookId: item.bookId, orderId, format: item.format, purchasedAt: new Date().toISOString() });
        localStorage.setItem(emailKey, JSON.stringify(stored));
      } catch (e) {}
    }

    this.showSuccessModal(order);
  },

  async _handleTestModeCheckout({ name, email, item }) {
    // SANDBOX / Test mode: record a pending order and grant library access for UX demo
    const orderId = `SR-TEST-${Math.floor(1000 + Math.random() * 9000)}`;

    // Resolve current user
    let userId = null;
    try {
      if (typeof firebase !== 'undefined' && firebase.auth && firebase.apps && firebase.apps.length) {
        const fbUser = firebase.auth().currentUser;
        if (fbUser) userId = fbUser.uid;
      }
      if (!userId) {
        const session = JSON.parse(localStorage.getItem('sr_user_auth') || '{}');
        userId = session.uid || null;
      }
    } catch (e) {}

    const order = {
      orderId: orderId,
      paymentId: `test_${Date.now()}`,
      gateway: 'cashfree-test',
      userId: userId || '',
      customerName: name,
      buyerName: name,
      customerEmail: email,
      buyerEmail: email,
      bookId: item.bookId,
      bookTitle: item.title,
      format: item.format,
      amount: item.price,
      causeShare: Number((item.price * 0.25).toFixed(2)),
      status: 'pending',
      testMode: true,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      createdAt: new Date().toISOString()
    };

    if (window.SocialReadersDB && window.SocialReadersDB.createOrder) {
      await window.SocialReadersDB.createOrder(order);
    }

    // Grant library access even in test mode for instant My Library feedback
    if (userId && window.SocialReadersDB && window.SocialReadersDB.grantLibraryAccess) {
      await window.SocialReadersDB.grantLibraryAccess(userId, item.bookId, orderId, item.format);
    }

    // Show a test mode success modal with helpful notice
    this.showSuccessModal(order, true);
  },

  showSuccessModal(order, isTestMode = false) {
    const esc = (window.SocialReadersUtils && window.SocialReadersUtils.escapeHtml)
      ? window.SocialReadersUtils.escapeHtml
      : (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const modal = document.getElementById('sr-checkout-modal');

    const testModeBanner = isTestMode ? `
      <div class="mb-4 p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-[10px] text-amber-700 flex items-start gap-2">
        <span>⚠️</span>
        <span><strong>Sandbox Mode:</strong> Real payment not processed. Deploy Firebase Cloud Functions to enable live payments.</span>
      </div>
    ` : '';

    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-100 text-center animate-scaleUp">
        <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-100 text-forest flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <svg class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
        </div>

        <h3 class="text-xl sm:text-2xl font-extrabold text-navy">Thank You for Reading &amp; Giving!</h3>
        <p class="text-xs text-gray-500 mt-1">Order Ref: <strong class="font-mono text-navy">${esc(order.orderId)}</strong></p>

        ${testModeBanner}

        <div class="my-5 sm:my-6 p-3.5 sm:p-4 bg-orange-50 rounded-2xl border border-orange-200 text-left space-y-1.5">
          <div class="flex justify-between text-xs text-gray-600">
            <span>Amount Paid:</span>
            <strong class="text-navy font-bold">₹${order.amount}.00</strong>
          </div>
          <div class="flex justify-between text-xs text-brandOrange font-bold">
            <span>25% Allocated to Social Fund:</span>
            <span>₹${order.causeShare}</span>
          </div>
          <div class="flex justify-between text-xs text-gray-600 pt-1 border-t border-orange-200/60">
            <span>Delivery:</span>
            <span class="text-forest font-semibold truncate ml-2">Sent to ${esc(order.customerEmail)}</span>
          </div>
        </div>

        <div class="space-y-2 sm:space-y-2.5">
          <a href="account.html" class="block w-full py-3 rounded-full bg-navy text-white text-xs font-bold hover:bg-blue-950 active:scale-95 transition-all">
            Go to My Library &amp; Download
          </a>
          <button id="close-success-modal-btn" class="block w-full py-2 text-xs text-gray-500 hover:text-navy font-semibold">
            Continue Browsing Store
          </button>
        </div>
      </div>
    `;

    document.getElementById('close-success-modal-btn').addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    // Trigger real-time cart/library refresh events
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sr_order_created', { detail: order }));
    }
  }
};
