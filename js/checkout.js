/**
 * Social Readers - Checkout & Order Processing
 * Calculates 25% Social Impact Share, simulates Razorpay payment, generates instant download receipts
 */

window.SocialReadersCheckout = {
  currentCartItem: null,

  openCheckout(bookId, format = 'ebook') {
    const book = window.SocialReadersDB.getBookById(bookId);
    if (!book) return;

    this.currentCartItem = {
      bookId: book.id,
      title: typeof book.title === 'object' ? (window.getLanguage() === 'ta' ? book.title.ta : book.title.en) : book.title,
      author: typeof book.author === 'object' ? (window.getLanguage() === 'ta' ? book.author.ta : book.author.en) : book.author,
      price: book.price,
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
      modal.className = 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4';
      document.body.appendChild(modal);
    }

    const item = this.currentCartItem;
    const causeShare = (item.price * 0.25).toFixed(2);

    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative animate-scaleUp">
        
        <!-- Close button -->
        <button id="close-checkout-modal" class="absolute top-5 right-5 p-2 text-gray-400 hover:text-navy">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <!-- Header -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-brandOrange text-xs font-bold uppercase mb-2">
            <span>25% for Youth Education &amp; Sports</span>
          </div>
          <h3 class="text-2xl font-extrabold text-navy">Secure Checkout</h3>
          <p class="text-xs text-gray-500 mt-1">Instant digital delivery + direct social impact</p>
        </div>

        <!-- Order Summary Box -->
        <div class="bg-[#FAF7F2] rounded-2xl p-4 border border-gray-100 flex items-center gap-4 mb-6">
          <img src="${item.coverUrl}" class="w-16 h-20 object-contain bg-white rounded-lg p-1 shadow-sm flex-shrink-0" alt="Book Cover">
          <div class="flex-grow">
            <h4 class="font-bold text-navy text-sm sm:text-base">${item.title}</h4>
            <p class="text-xs text-gray-500">${item.author} • <span class="text-forest font-semibold">${item.format}</span></p>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-lg font-extrabold text-navy">₹${item.price}.00</span>
              <span class="text-xs font-bold text-brandOrange bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                ₹${causeShare} to Cause
              </span>
            </div>
          </div>
        </div>

        <!-- Checkout Form -->
        <form id="sr-checkout-form" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-navy mb-1">Full Name</label>
            <input type="text" id="buyer-name" required value="Ananya Sharma" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy">
          </div>

          <div>
            <label class="block text-xs font-bold text-navy mb-1">Email for Instant Delivery</label>
            <input type="email" id="buyer-email" required value="reader@socialreaders.org" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy">
          </div>

          <!-- 25% Allocation Transparency Notice -->
          <div class="p-3 bg-green-50 rounded-xl border border-green-200 text-xs text-forest flex items-start gap-2">
            <span class="font-bold">✓</span>
            <span>₹${causeShare} (25%) will be earmarked directly for textbooks and sports equipment.</span>
          </div>

          <div class="pt-2">
            <button type="submit" id="pay-submit-btn" class="w-full py-3.5 rounded-full bg-forest text-white font-bold text-sm hover:bg-green-800 transition-all shadow-md flex items-center justify-center gap-2">
              <span>Pay ₹${item.price}.00 (Razorpay / UPI / Card)</span>
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
      const name = document.getElementById('buyer-name').value;
      const email = document.getElementById('buyer-email').value;
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
      <span>Processing Payment...</span>
    `;

    setTimeout(() => {
      const orderId = `SR-${Math.floor(1000 + Math.random() * 9000)}`;
      const order = {
        orderId: orderId,
        customerName: name,
        customerEmail: email,
        bookTitle: this.currentCartItem.title,
        format: this.currentCartItem.format,
        amount: this.currentCartItem.price,
        causeShare: Number((this.currentCartItem.price * 0.25).toFixed(2)),
        status: "Completed",
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      window.SocialReadersDB.createOrder(order);
      this.showSuccessModal(order);
    }, 1200);
  },

  showSuccessModal(order) {
    const modal = document.getElementById('sr-checkout-modal');
    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 text-center animate-scaleUp">
        <div class="w-16 h-16 rounded-full bg-green-100 text-forest flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
        </div>

        <h3 class="text-2xl font-extrabold text-navy">Thank You for Reading &amp; Giving!</h3>
        <p class="text-xs text-gray-500 mt-1">Order Ref: <strong class="font-mono text-navy">${order.orderId}</strong></p>

        <div class="my-6 p-4 bg-orange-50 rounded-2xl border border-orange-200 text-left space-y-1.5">
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
            <span class="text-forest font-semibold">Sent to ${order.customerEmail}</span>
          </div>
        </div>

        <div class="space-y-2.5">
          <a href="account.html" class="block w-full py-3 rounded-full bg-navy text-white text-xs font-bold hover:bg-blue-950 transition-colors">
            Go to My Library &amp; Download
          </a>
          <button onclick="document.getElementById('sr-checkout-modal').classList.add('hidden')" class="block w-full py-2.5 text-xs text-gray-500 hover:text-navy font-semibold">
            Continue Browsing Store
          </button>
        </div>
      </div>
    `;
  }
};
