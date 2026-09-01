/**
 * Social Readers - Checkout & Order Processing
 * Calculates 25% Social Impact Share, simulates Razorpay payment, generates instant download receipts
 */

window.SocialReadersCheckout = {
  currentCartItem: null,

  async openCheckout(bookId, format = 'ebook') {
    let book = null;
    if (window.SocialReadersDB) {
      if (window.SocialReadersDB.getBookById) {
        book = await window.SocialReadersDB.getBookById(bookId);
      }
      if (!book && window.SocialReadersDB.getBooksSync) {
        book = window.SocialReadersDB.getBooksSync(true).find(b => b.id === bookId);
      }
    }
    if (!book) return;

    this.currentCartItem = {
      bookId: book.id,
      title: typeof book.title === 'object' ? (window.getLanguage && window.getLanguage() === 'ta' ? (book.title.ta || book.title.en) : book.title.en) : book.title,
      author: typeof book.author === 'object' ? (window.getLanguage && window.getLanguage() === 'ta' ? (book.author.ta || book.author.en) : book.author.en) : book.author,
      price: format === 'audiobook' ? (book.priceAudiobook || book.price || 199) : (book.priceEbook || book.price || 149),
      coverUrl: book.coverUrl,
      format: format === 'audiobook' ? 'Audiobook' : (format === 'both' ? 'E-Book + Audiobook' : 'E-Book')
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

    const item = this.currentCartItem;
    const causeShare = (item.price * 0.25).toFixed(2);

    const currentUser = window.SocialReadersAuth && window.SocialReadersAuth.getCurrentUser ? window.SocialReadersAuth.getCurrentUser() : null;
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
          <p class="text-xs text-gray-500 mt-1">Instant digital delivery + direct social impact</p>
        </div>

        <!-- Order Summary Box -->
        <div class="bg-[#FAF7F2] rounded-2xl p-3.5 sm:p-4 border border-gray-100 flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
          <img src="${item.coverUrl}" class="w-14 h-18 sm:w-16 sm:h-20 object-contain bg-white rounded-lg p-1 shadow-sm flex-shrink-0" alt="Book Cover">
          <div class="flex-grow min-w-0">
            <h4 class="font-bold text-navy text-xs sm:text-base truncate">${item.title}</h4>
            <p class="text-[11px] sm:text-xs text-gray-500 truncate">${item.author} • <span class="text-forest font-semibold">${item.format}</span></p>
            <div class="mt-1.5 sm:mt-2 flex items-center justify-between">
              <span class="text-base sm:text-lg font-extrabold text-navy">₹${item.price}.00</span>
              <span class="text-[10px] sm:text-xs font-bold text-brandOrange bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                ₹${causeShare} to Cause
              </span>
            </div>
          </div>
        </div>

        <!-- Checkout Form -->
        <form id="sr-checkout-form" class="space-y-3.5 sm:space-y-4">
          <div>
            <label class="block text-xs font-bold text-navy mb-1">Full Name</label>
            <input type="text" id="buyer-name" required value="${prefillName}" placeholder="Your full name" class="w-full px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy" style="font-size: 16px;">
          </div>

          <div>
            <label class="block text-xs font-bold text-navy mb-1">Email for Instant Delivery</label>
            <input type="email" id="buyer-email" required value="${prefillEmail}" placeholder="you@example.com" class="w-full px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy" style="font-size: 16px;">
          </div>

          <!-- 25% Allocation Transparency Notice -->
          <div class="p-3 bg-green-50 rounded-xl border border-green-200 text-xs text-forest flex items-start gap-2">
            <span class="font-bold flex-shrink-0">✓</span>
            <span>₹${causeShare} (25%) will be earmarked directly for textbooks and sports equipment.</span>
          </div>

          <div class="pt-2">
            <button type="submit" id="pay-submit-btn" class="w-full py-3.5 rounded-full bg-forest text-white font-bold text-xs sm:text-sm hover:bg-green-800 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>
              <span>Pay with Razorpay (₹${item.price}.00)</span>
            </button>
          </div>
        </form>

      </div>
    `;

    modal.classList.remove('hidden');

    // Bind Close
    document.getElementById('close-checkout-modal').addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    // Bind Submit
    document.getElementById('sr-checkout-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('buyer-name').value.trim();
      const email = document.getElementById('buyer-email').value.trim();
      this.processPayment(name, email);
    });
  },

  processPayment(name, email) {
    const payBtn = document.getElementById('pay-submit-btn');
    payBtn.disabled = true;
    payBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span>Connecting to Razorpay...</span>
    `;

    const item = this.currentCartItem;
    const amountInPaise = Math.round(item.price * 100);
    const keyId = localStorage.getItem('sr_razorpay_key_id') || "rzp_test_TWjICbE8TiyTnQ";

    // Load Razorpay script if not already present
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      });
    };

    loadRazorpay().then((isLoaded) => {
      if (isLoaded && window.Razorpay) {
        const options = {
          key: keyId,
          amount: amountInPaise,
          currency: "INR",
          name: "Social Readers",
          description: `${item.title} (${item.format}) — 25% Social Cause`,
          image: item.coverUrl || "assets/cover-atomic-habits.svg",
          prefill: {
            name: name,
            email: email
          },
          theme: {
            color: "#2E7D32"
          },
          modal: {
            ondismiss: () => {
              payBtn.disabled = false;
              payBtn.innerHTML = `<span>Pay with Razorpay (₹${item.price}.00)</span>`;
            }
          },
          handler: (response) => {
            const orderId = `SR-${Math.floor(1000 + Math.random() * 9000)}`;
            const order = {
              orderId: orderId,
              paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
              customerName: name,
              buyerName: name,
              customerEmail: email,
              buyerEmail: email,
              bookId: item.bookId,
              bookTitle: item.title,
              format: item.format,
              amount: item.price,
              causeShare: Number((item.price * 0.25).toFixed(2)),
              status: "Completed",
              date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              createdAt: new Date().toISOString()
            };

            window.SocialReadersDB.createOrder(order);
            this.showSuccessModal(order);
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (resp) => {
          alert(`Payment failed: ${resp.error.description || 'Please try again.'}`);
          payBtn.disabled = false;
          payBtn.innerHTML = `<span>Retry Payment (₹${item.price}.00)</span>`;
        });
        rzp.open();
      } else {
        // Fallback simulation mode if offline / blocked
        setTimeout(() => {
          const orderId = `SR-${Math.floor(1000 + Math.random() * 9000)}`;
          const order = {
            orderId: orderId,
            customerName: name,
            buyerName: name,
            customerEmail: email,
            buyerEmail: email,
            bookId: item.bookId,
            bookTitle: item.title,
            format: item.format,
            amount: item.price,
            causeShare: Number((item.price * 0.25).toFixed(2)),
            status: "Completed",
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            createdAt: new Date().toISOString()
          };

          window.SocialReadersDB.createOrder(order);
          this.showSuccessModal(order);
        }, 1200);
      }
    });
  },

  showSuccessModal(order) {
    const modal = document.getElementById('sr-checkout-modal');
    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-100 text-center animate-scaleUp">
        <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-100 text-forest flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <svg class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
        </div>

        <h3 class="text-xl sm:text-2xl font-extrabold text-navy">Thank You for Reading &amp; Giving!</h3>
        <p class="text-xs text-gray-500 mt-1">Order Ref: <strong class="font-mono text-navy">${order.orderId}</strong></p>

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
            <span class="text-forest font-semibold truncate ml-2">Sent to ${order.customerEmail}</span>
          </div>
        </div>

        <div class="space-y-2 sm:space-y-2.5">
          <a href="account.html" class="block w-full py-3 rounded-full bg-navy text-white text-xs font-bold hover:bg-blue-950 active:scale-95 transition-all">
            Go to My Library &amp; Download
          </a>
          <button onclick="document.getElementById('sr-checkout-modal').classList.add('hidden')" class="block w-full py-2 text-xs text-gray-500 hover:text-navy font-semibold">
            Continue Browsing Store
          </button>
        </div>
      </div>
    `;
  }
};
