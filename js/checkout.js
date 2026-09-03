/**
 * Social Readers — Checkout & Order Processing
 * Payment Gateway: Cashfree Payments (PG JS SDK v3)
 *
 * Security Principles:
 *   1. Order creation and pricing calculation are strictly performed server-side by Firebase Cloud Functions.
 *   2. The Cashfree Secret Key is NEVER in frontend code.
 *   3. Payment status is strictly verified server-side with the Cashfree API.
 *   4. Digital entitlements in Firestore are granted ONLY by Cloud Functions / Admin SDK upon verified payment.
 *   5. The client NEVER modifies payment status or writes directly to user entitlements.
 */

window.SocialReadersCheckout = {
  currentCartItem: null,

  async openCheckout(bookId, format = 'ebook') {
    let book = null;

    // Fetch book metadata from Firestore
    if (window.SocialReadersDB && window.SocialReadersDB.getBookById) {
      book = await window.SocialReadersDB.getBookById(bookId);
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

    // Server-verified base price — Cloud Functions will re-verify against Firestore
    let displayPrice = 149;
    if (format === 'audiobook') {
      displayPrice = Number(book.priceAudiobook) || Number(book.price) || 199;
    } else if (format === 'both') {
      const ebookP = Number(book.priceEbook) || Number(book.price) || 149;
      const audioP = Number(book.priceAudiobook) || 199;
      displayPrice = Math.round((ebookP + audioP) * 0.85); // 15% bundle discount
    } else {
      displayPrice = Number(book.priceEbook) || Number(book.price) || 149;
    }

    if (isNaN(displayPrice) || displayPrice <= 0) displayPrice = 149;

    const formatLabel = format === 'audiobook' ? 'Audiobook' : (format === 'both' ? 'E-Book + Audiobook' : 'E-Book');

    this.currentCartItem = {
      bookId: book.id,
      title: titleStr || 'E-Book',
      author: authorStr || 'Author',
      price: displayPrice,
      coverUrl: book.coverImageUrl || book.coverUrl || 'assets/cover-atomic-habits.svg',
      format: formatLabel,
      rawFormat: format
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
      if (!window.CashfreeService) {
        throw new Error('Payment gateway is currently initializing. Please try again in a moment.');
      }

      // ─── STEP 1: Create Cashfree Order via Firebase Cloud Function ─────────
      payBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg><span>Connecting to Cashfree...</span>`;

      const orderResult = await window.CashfreeService.createOrder({
        bookId: item.bookId,
        format: item.rawFormat || 'ebook',
        buyerName: name,
        buyerEmail: email
      });

      const paymentSessionId = orderResult.paymentSessionId;
      const cashfreeOrderId = orderResult.orderId;
      const finalAmount = orderResult.amount || item.price;

      if (!paymentSessionId) {
        throw new Error('Payment session could not be established. Please try again.');
      }

      // ─── STEP 2: Load Cashfree SDK & Open Payment Drop-in Popup ───────────
      payBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg><span>Opening Payment Window...</span>`;

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

        // ─── STEP 3: Server-side Payment Verification ───────────────────────
        payBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg><span>Verifying with Server...</span>`;

        const verification = await window.CashfreeService.verifyPayment(cashfreeOrderId);

        if (verification && verification.success && verification.status === 'PAID') {
          this.showSuccessModal({
            orderId: cashfreeOrderId,
            amount: finalAmount,
            causeShare: Number((finalAmount * 0.25).toFixed(2)),
            customerEmail: email,
            bookTitle: item.title,
            format: item.format
          });
          return;
        } else {
          throw new Error('Payment status could not be verified by server. If amount was deducted, access will be granted automatically via webhook.');
        }
      }

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

  showSuccessModal(order) {
    const esc = (window.SocialReadersUtils && window.SocialReadersUtils.escapeHtml)
      ? window.SocialReadersUtils.escapeHtml
      : (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const modal = document.getElementById('sr-checkout-modal');

    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-100 text-center animate-scaleUp">
        <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-100 text-forest flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <svg class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
        </div>

        <h3 class="text-xl sm:text-2xl font-extrabold text-navy">Payment Verified!</h3>
        <p class="text-xs text-gray-500 mt-1">Order Ref: <strong class="font-mono text-navy">${esc(order.orderId)}</strong></p>

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
            <span>Access:</span>
            <span class="text-forest font-semibold truncate ml-2">Delivered to ${esc(order.customerEmail)}</span>
          </div>
        </div>

        <div class="space-y-2 sm:space-y-2.5">
          <a href="account.html" class="block w-full py-3 rounded-full bg-navy text-white text-xs font-bold hover:bg-blue-950 active:scale-95 transition-all">
            Go to My Library
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

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sr_order_created', { detail: order }));
    }
  }
};
