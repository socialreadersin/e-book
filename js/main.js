/**
 * Social Readers - Main Application Logic
 * Navigation, Tab Switching, Wishlist, Category & Format Filters, Reader & Audio hooks
 */

document.addEventListener('DOMContentLoaded', () => {
  // Highlight active nav links based on current path
  highlightActiveNav();

  // Initialize interactive components
  initHeroSlider();
  initDynamicHomepageContent();
  initLightningDealsTimer();
  initBookCarousels();
  initHeaderSearchBar();
  initWishlistButtons();
  initCategoryFilters();
  initFormatFilters();
  initAccountTabs();
  initToastSystem();
  initBookDetailStickyBar();
  initMobileReadAndDownloadButtons();
});

/**
 * Automatically highlight active link in top nav and mobile bottom bar
 */
function highlightActiveNav() {
  const currentPath = window.location.pathname;
  const page = currentPath.split('/').pop() || 'index.html';

  // Desktop links
  const desktopLinks = document.querySelectorAll('.desktop-nav-link');
  desktopLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html') || (page === 'index.html' && href === 'index.html')) {
      link.classList.add('text-navy', 'font-bold', 'border-b-2', 'border-forest-green');
      link.classList.remove('text-gray-600');
    }
  });

  // Mobile bottom tabs
  const mobileTabs = document.querySelectorAll('.mobile-tab-item');
  mobileTabs.forEach((tab) => {
    const href = tab.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html') || (page === 'index.html' && href === 'index.html')) {
      tab.classList.add('text-navy', 'font-bold');
      tab.classList.remove('text-gray-500');
      const icon = tab.querySelector('svg');
      if (icon) {
        icon.classList.add('stroke-[2.5px]');
      }
    }
  });
}

/**
 * Interactive Wishlist button toggle with localStorage persistence
 */
function initWishlistButtons() {
  let savedWishlist = [];
  try {
    savedWishlist = JSON.parse(localStorage.getItem('sr_wishlist')) || [];
  } catch(e) {
    savedWishlist = [];
  }

  document.querySelectorAll('.wishlist-btn').forEach((btn) => {
    // Determine book id
    const card = btn.closest('[data-book-id], .catalog-book-card');
    const bookId = btn.getAttribute('data-book-id') || 
                   btn.closest('[data-book-id]')?.getAttribute('data-book-id') || 
                   (btn.closest('.catalog-book-card')?.querySelector('[data-book-id]')?.getAttribute('data-book-id'));

    const heartIcon = btn.querySelector('svg');

    // Restore active state
    if (bookId && savedWishlist.includes(bookId)) {
      btn.setAttribute('data-liked', 'true');
      if (heartIcon) {
        heartIcon.setAttribute('fill', '#E8720C');
        heartIcon.setAttribute('stroke', '#E8720C');
      }
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isFilled = btn.getAttribute('data-liked') === 'true';

      if (isFilled) {
        btn.setAttribute('data-liked', 'false');
        if (heartIcon) {
          heartIcon.setAttribute('fill', 'none');
          heartIcon.setAttribute('stroke', '#E8720C');
        }
        if (bookId) {
          savedWishlist = savedWishlist.filter(id => id !== bookId);
          localStorage.setItem('sr_wishlist', JSON.stringify(savedWishlist));
        }
        showToast('Removed from Wishlist');
      } else {
        btn.setAttribute('data-liked', 'true');
        if (heartIcon) {
          heartIcon.setAttribute('fill', '#E8720C');
          heartIcon.setAttribute('stroke', '#E8720C');
        }
        btn.classList.add('scale-125');
        setTimeout(() => btn.classList.remove('scale-125'), 200);
        if (bookId && !savedWishlist.includes(bookId)) {
          savedWishlist.push(bookId);
          localStorage.setItem('sr_wishlist', JSON.stringify(savedWishlist));
        }
        showToast('Added to Wishlist ❤️');
      }
    });
  });
}

/**
 * Global State & Unified Filter Function for books.html
 */
let currentCategoryFilter = 'all';
let currentFormatFilter = 'all';
let currentSearchTerm = '';

function applyBookFilters() {
  const bookCards = document.querySelectorAll('.catalog-book-card');
  let visibleCount = 0;

  bookCards.forEach((card) => {
    const cardCat = card.getAttribute('data-category') || '';
    const cardType = card.getAttribute('data-type') || 'both';
    const title = card.querySelector('.book-title')?.textContent.toLowerCase() || '';
    const author = card.querySelector('.book-author')?.textContent.toLowerCase() || '';

    const matchesCategory = currentCategoryFilter === 'all' || cardCat === currentCategoryFilter;
    const matchesFormat = currentFormatFilter === 'all' || cardType === currentFormatFilter || cardType === 'both';
    const matchesSearch = !currentSearchTerm || title.includes(currentSearchTerm) || author.includes(currentSearchTerm);

    const isVisible = matchesCategory && matchesFormat && matchesSearch;

    if (isVisible) {
      card.style.display = ''; // Preserves original flex layout from stylesheet
      card.classList.remove('hidden');
      visibleCount++;
    } else {
      card.style.display = 'none';
      card.classList.add('hidden');
    }
  });

  // Toggle "No Books Found" empty state
  let noResultsEl = document.getElementById('books-no-results');
  const gridContainer = document.getElementById('books-catalog-grid') || document.querySelector('.catalog-book-card')?.parentElement;
  
  if (visibleCount === 0 && gridContainer) {
    if (!noResultsEl) {
      noResultsEl = document.createElement('div');
      noResultsEl.id = 'books-no-results';
      noResultsEl.className = 'col-span-full py-12 px-4 text-center bg-white rounded-3xl border border-gray-100 shadow-sm my-4';
      noResultsEl.innerHTML = `
        <div class="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-orange-50 text-brandOrange flex items-center justify-center text-2xl sm:text-3xl mb-3 shadow-inner">
          🔍
        </div>
        <h3 class="text-base sm:text-lg font-bold text-navy">No E-Books Found</h3>
        <p class="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mt-1">
          We couldn't find any books matching your selected filters or search terms.
        </p>
        <button type="button" id="reset-book-filters-btn" class="mt-4 px-5 py-2 rounded-full bg-navy text-white text-xs font-bold hover:bg-blue-950 active:scale-95 transition-all shadow-sm">
          Reset All Filters
        </button>
      `;
      gridContainer.appendChild(noResultsEl);
      document.getElementById('reset-book-filters-btn')?.addEventListener('click', resetAllBookFilters);
    } else {
      noResultsEl.classList.remove('hidden');
    }
  } else if (noResultsEl) {
    noResultsEl.classList.add('hidden');
  }
}

function resetAllBookFilters() {
  currentCategoryFilter = 'all';
  currentFormatFilter = 'all';
  currentSearchTerm = '';

  const searchInput = document.getElementById('bookSearchInput');
  if (searchInput) searchInput.value = '';

  document.querySelectorAll('.category-filter-btn').forEach(btn => {
    const isAll = btn.getAttribute('data-category') === 'all';
    btn.classList.toggle('bg-navy', isAll);
    btn.classList.toggle('text-white', isAll);
    btn.classList.toggle('bg-white', !isAll);
    btn.classList.toggle('text-navy', !isAll);
    btn.classList.toggle('border', !isAll);
    btn.classList.toggle('border-gray-200', !isAll);
  });

  document.querySelectorAll('.format-filter-btn').forEach(btn => {
    const isAll = btn.getAttribute('data-format') === 'all';
    btn.classList.toggle('bg-navy', isAll);
    btn.classList.toggle('text-white', isAll);
    btn.classList.toggle('bg-white', !isAll);
    btn.classList.toggle('text-navy', !isAll);
    btn.classList.toggle('border', !isAll);
    btn.classList.toggle('border-gray-200', !isAll);
  });

  applyBookFilters();
}

/**
 * Filter books by category and live search in books.html
 */
function initCategoryFilters() {
  const filterBtns = document.querySelectorAll('.category-filter-btn');
  const bookCards = document.querySelectorAll('.catalog-book-card');

  if (!filterBtns.length && !bookCards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentCategoryFilter = btn.getAttribute('data-category') || 'all';

      // Update active button styling
      filterBtns.forEach((b) => {
        b.classList.remove('bg-navy', 'text-white');
        b.classList.add('bg-white', 'text-navy', 'border', 'border-gray-200');
      });
      btn.classList.add('bg-navy', 'text-white');
      btn.classList.remove('bg-white', 'text-navy', 'border', 'border-gray-200');

      applyBookFilters();
    });
  });

  // Search input filter for books
  const searchInput = document.getElementById('bookSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value.toLowerCase().trim();
      applyBookFilters();
    });
  }

  // Parse URL Query parameters (e.g., books.html?q=atomic or books.html?cat=business)
  const urlParams = new URLSearchParams(window.location.search);
  const qParam = urlParams.get('q');
  const catParam = urlParams.get('cat');

  if (qParam && searchInput) {
    searchInput.value = qParam;
    currentSearchTerm = qParam.toLowerCase().trim();
  }
  if (catParam) {
    const matchingBtn = document.querySelector(`.category-filter-btn[data-category="${catParam}"]`);
    if (matchingBtn) {
      filterBtns.forEach((b) => {
        b.classList.remove('bg-navy', 'text-white');
        b.classList.add('bg-white', 'text-navy', 'border', 'border-gray-200');
      });
      matchingBtn.classList.add('bg-navy', 'text-white');
      matchingBtn.classList.remove('bg-white', 'text-navy', 'border', 'border-gray-200');
      currentCategoryFilter = catParam;
    }
  }

  applyBookFilters();
}

/**
 * Filter by format (All / E-Books / Audiobooks)
 */
function initFormatFilters() {
  const formatBtns = document.querySelectorAll('.format-filter-btn');
  if (!formatBtns.length) return;

  formatBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentFormatFilter = btn.getAttribute('data-format') || 'all';

      formatBtns.forEach((b) => {
        b.classList.remove('bg-navy', 'text-white');
        b.classList.add('bg-white', 'text-navy', 'border', 'border-gray-200');
      });
      btn.classList.add('bg-navy', 'text-white');
      btn.classList.remove('bg-white', 'text-navy', 'border', 'border-gray-200');

      applyBookFilters();
    });
  });
}

/**
 * Tab switching and dynamic content rendering in account.html
 */
function initAccountTabs() {
  const tabBtns = document.querySelectorAll('.account-tab-btn');
  const tabPanes = document.querySelectorAll('.account-tab-pane');

  if (!tabBtns.length) return;

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab-target');

      // Button styles
      tabBtns.forEach((b) => {
        b.classList.remove('border-forest-green', 'border-forest', 'text-navy', 'font-bold');
        b.classList.add('border-transparent', 'text-gray-500');
      });
      btn.classList.add('border-forest', 'text-navy', 'font-bold');
      btn.classList.remove('border-transparent', 'text-gray-500');

      // Pane visibility
      tabPanes.forEach((pane) => {
        if (pane.id === targetId) {
          pane.classList.remove('hidden');
        } else {
          pane.classList.add('hidden');
        }
      });
    });
  });

  // Render dynamic order history and impact if on account page
  renderDynamicAccountData();
}

/**
 * Sync dynamic orders, library counts, and personal impact in account.html
 * Scoped strictly to the currently logged-in user
 */
async function renderDynamicAccountData() {
  if (!window.SocialReadersDB) return;

  const currentUser = window.SocialReadersAuth && window.SocialReadersAuth.getCurrentUser ? window.SocialReadersAuth.getCurrentUser() : null;

  // Profile Header UI Elements
  const welcomeTitle = document.querySelector('[data-i18n="account.welcome"]');
  const userEmailEl = document.querySelector('[data-i18n="account.email"]');
  const avatarEl = document.querySelector('.w-14.h-14, .w-16.h-16, .w-20.h-20');
  const impactMetricEl = document.querySelector('[data-i18n="account.impact_metric"]');
  const statFundEl = document.getElementById('account-total-fund-stat');
  const textbooksCountEl = document.getElementById('account-textbooks-stat');
  const spikesCountEl = document.getElementById('account-spikes-stat');
  const libraryTabBtn = document.querySelector('[data-tab-target="tab-library"]');
  const libraryPane = document.getElementById('tab-library');
  const ordersTbody = document.getElementById('account-orders-tbody');
  const ordersMobileContainer = document.getElementById('account-orders-mobile');

  // 1. IF GUEST / LOGGED OUT: Show clear sign-in prompts and zeroed personal stats
  if (!currentUser) {
    if (welcomeTitle) welcomeTitle.textContent = "Welcome to Social Readers";
    if (userEmailEl) userEmailEl.textContent = "Sign in to access your library, downloads, and receipts.";
    if (avatarEl) avatarEl.textContent = "SR";

    if (impactMetricEl) {
      impactMetricEl.textContent = "Sign in to see your 25% personal contribution!";
    }
    if (statFundEl) statFundEl.textContent = "₹0.00";
    if (textbooksCountEl) textbooksCountEl.textContent = "0";
    if (spikesCountEl) spikesCountEl.textContent = "0 Pair";

    if (libraryTabBtn) libraryTabBtn.textContent = "My Library (0)";

    if (libraryPane) {
      libraryPane.innerHTML = `
        <div class="col-span-full py-12 px-4 text-center bg-white rounded-3xl border border-gray-100 shadow-xs max-w-xl mx-auto my-4">
          <div class="w-14 h-14 rounded-full bg-blue-50 text-navy flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h3 class="text-base font-bold text-navy">Sign In to See Your Library</h3>
          <p class="text-xs text-gray-500 mt-1 mb-4">Your purchased e-books and audiobooks will appear here once you sign in.</p>
          <a href="books.html" class="inline-flex px-5 py-2.5 rounded-full bg-navy text-white text-xs font-bold hover:bg-blue-900 active:scale-95 transition-all shadow-sm">
            Explore Book Catalog
          </a>
        </div>
      `;
    }

    if (ordersTbody) {
      ordersTbody.innerHTML = `
        <tr>
          <td colspan="6" class="p-8 text-center text-gray-400 text-xs">
            Sign in to view your order history.
          </td>
        </tr>
      `;
    }

    if (ordersMobileContainer) {
      ordersMobileContainer.innerHTML = `
        <div class="p-6 text-center text-gray-400 text-xs bg-white rounded-2xl border border-gray-100">
          Sign in to view your order history.
        </div>
      `;
    }
    return;
  }

  // 2. IF LOGGED IN: Filter orders strictly matching currentUser.email
  const userEmail = (currentUser.email || '').toLowerCase().trim();
  const userName = currentUser.name || userEmail.split('@')[0];

  if (welcomeTitle) welcomeTitle.textContent = `Welcome back, ${userName}!`;
  if (userEmailEl) userEmailEl.textContent = currentUser.email;
  if (avatarEl) avatarEl.textContent = userName.substring(0, 2).toUpperCase();

  let allOrders = [];
  try {
    allOrders = await window.SocialReadersDB.getOrders();
  } catch (e) {
    allOrders = window.SocialReadersDB.getOrdersSync ? window.SocialReadersDB.getOrdersSync() : [];
  }

  // Filter orders strictly for this customer
  const userOrders = (allOrders || []).filter(ord => {
    const buyer = (ord.customerEmail || ord.buyerEmail || '').toLowerCase().trim();
    return buyer === userEmail;
  });

  // Calculate totals for logged in user
  let totalFund = 0;
  userOrders.forEach(o => {
    totalFund += (Number(o.causeShare) || (Number(o.amount) * 0.25) || 0);
  });

  if (impactMetricEl) {
    impactMetricEl.textContent = `You contributed ₹${totalFund.toFixed(2)} to youth so far!`;
  }
  if (statFundEl) {
    statFundEl.textContent = `₹${totalFund.toFixed(2)}`;
  }
  if (textbooksCountEl) {
    textbooksCountEl.textContent = Math.floor(totalFund / 75);
  }
  if (spikesCountEl) {
    spikesCountEl.textContent = `${Math.floor(totalFund / 150)} Pair`;
  }

  if (libraryTabBtn) {
    libraryTabBtn.textContent = `My Library (${userOrders.length})`;
  }

  // Render User Library
  if (libraryPane) {
    if (userOrders.length === 0) {
      libraryPane.innerHTML = `
        <div class="col-span-full py-12 px-4 text-center bg-white rounded-3xl border border-gray-100 shadow-xs max-w-xl mx-auto my-4">
          <div class="w-14 h-14 rounded-full bg-emerald-50 text-forest flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          <h3 class="text-base font-bold text-navy">Your Library is Empty</h3>
          <p class="text-xs text-gray-500 mt-1 mb-4">You haven't purchased any books yet. 25% of every purchase directly educates students and supports rural athletes!</p>
          <a href="books.html" class="inline-flex px-5 py-2.5 rounded-full bg-forest text-white text-xs font-bold hover:bg-green-800 active:scale-95 transition-all shadow-sm">
            Browse Books &amp; Audiobooks
          </a>
        </div>
      `;
    } else {
      let booksCatalog = [];
      try {
        booksCatalog = await window.SocialReadersDB.getBooks();
      } catch (e) {
        booksCatalog = window.SocialReadersDB.getBooksSync ? window.SocialReadersDB.getBooksSync() : [];
      }

      const libraryHtml = userOrders.map(ord => {
        const matchingBook = booksCatalog.find(b => b.id === ord.bookId || b.title === ord.bookTitle) || {
          id: ord.bookId || 'b1',
          title: ord.bookTitle || 'Purchased Book',
          author: 'Social Readers Author',
          coverUrl: 'assets/cover-atomic-habits.svg'
        };
        const titleText = typeof matchingBook.title === 'object' ? (matchingBook.title.en || matchingBook.title.ta) : matchingBook.title;
        const authorText = typeof matchingBook.author === 'object' ? (matchingBook.author.en || matchingBook.author.ta) : matchingBook.author;

        return `
          <div class="bg-white rounded-2xl p-2.5 sm:p-4 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div class="w-full h-36 sm:h-52 bg-gray-50 rounded-xl flex items-center justify-center p-2 overflow-hidden">
                <img src="${matchingBook.coverUrl || 'assets/cover-atomic-habits.svg'}" alt="${titleText}" class="max-h-full max-w-full object-contain rounded-lg">
              </div>
              <h3 class="font-bold text-navy text-xs sm:text-sm mt-2 line-clamp-2 min-h-[2rem] flex items-center">${titleText}</h3>
              <p class="text-[10px] sm:text-xs text-gray-500 truncate">${authorText}</p>
            </div>
            <div class="mt-2.5 pt-2 border-t border-gray-100 space-y-1.5">
              <button type="button" data-read-sample="true" data-book-id="${matchingBook.id}" class="w-full py-1.5 sm:py-2 rounded-lg bg-navy text-white text-[10px] sm:text-xs font-bold hover:bg-blue-900 active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1">
                <span>Read Online</span>
              </button>
              <div class="grid grid-cols-2 gap-1">
                <button type="button" data-download-book="${titleText}" class="py-1 rounded-md border border-gray-200 text-navy text-[10px] font-semibold hover:bg-gray-50 active:scale-95 transition-all text-center">
                  PDF
                </button>
                <button type="button" onclick="window.SocialReadersAudioPlayer.playTrack('${titleText}', '${authorText}', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '${matchingBook.coverUrl || 'assets/cover-atomic-habits.svg'}')" class="py-1 rounded-md bg-orange-50 text-brandOrange text-[10px] font-semibold hover:bg-orange-100 active:scale-95 transition-all text-center">
                  Listen
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      libraryPane.innerHTML = `<div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">${libraryHtml}</div>`;
      initSampleReaderTriggers();
    }
  }

  // Render Orders Desktop Table
  if (ordersTbody) {
    if (userOrders.length === 0) {
      ordersTbody.innerHTML = `
        <tr>
          <td colspan="6" class="p-8 text-center text-gray-400 text-xs">
            No orders found for this account.
          </td>
        </tr>
      `;
    } else {
      ordersTbody.innerHTML = userOrders.map(ord => `
        <tr class="hover:bg-gray-50/75 transition-colors">
          <td class="p-3 sm:p-4 font-mono font-bold text-navy">${ord.orderId || '#SR-9800'}</td>
          <td class="p-3 sm:p-4">
            <div class="font-semibold text-gray-800">${ord.bookTitle}</div>
            <div class="text-[11px] text-forest font-medium">${ord.format || 'E-Book'}</div>
          </td>
          <td class="p-3 sm:p-4 text-xs text-gray-500 whitespace-nowrap">${ord.date || 'Today'}</td>
          <td class="p-3 sm:p-4 font-bold text-navy whitespace-nowrap">₹${ord.amount}.00</td>
          <td class="p-3 sm:p-4 font-bold text-brandOrange whitespace-nowrap">₹${Number(ord.causeShare || ord.amount * 0.25).toFixed(2)}</td>
          <td class="p-3 sm:p-4">
            <button type="button" onclick="showToast('Downloading invoice ${ord.orderId} PDF...')" class="inline-flex items-center gap-1 text-navy hover:text-forest font-bold text-xs underline">
              <span>Receipt</span>
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Render Orders Mobile Cards
  if (ordersMobileContainer) {
    if (userOrders.length === 0) {
      ordersMobileContainer.innerHTML = `
        <div class="p-6 text-center text-gray-400 text-xs bg-white rounded-2xl border border-gray-100">
          No orders found for this account.
        </div>
      `;
    } else {
      ordersMobileContainer.innerHTML = userOrders.map(ord => `
        <div class="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-2.5">
          <div class="flex items-center justify-between">
            <span class="font-mono text-xs font-bold text-navy px-2 py-0.5 bg-gray-100 rounded-md">${ord.orderId || '#SR-9800'}</span>
            <span class="text-[11px] text-gray-400 font-medium">${ord.date || 'Recent'}</span>
          </div>
          <div class="flex items-start justify-between gap-2">
            <div>
              <h4 class="font-bold text-navy text-sm leading-tight">${ord.bookTitle}</h4>
              <span class="text-[10px] text-forest font-bold uppercase tracking-wider">${ord.format || 'E-Book'}</span>
            </div>
            <div class="text-right flex-shrink-0">
              <span class="text-sm font-black text-navy">₹${ord.amount}.00</span>
              <span class="text-[10px] font-bold text-brandOrange block">₹${Number(ord.causeShare || ord.amount * 0.25).toFixed(2)} cause</span>
            </div>
          </div>
          <div class="pt-2 border-t border-gray-50 flex items-center justify-between">
            <span class="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              ● Completed
            </span>
            <button type="button" onclick="showToast('Downloading invoice ${ord.orderId} PDF...')" class="px-2.5 py-1 rounded-lg bg-gray-100 text-navy font-bold text-xs hover:bg-navy hover:text-white transition-all active:scale-95">
              Download Receipt
            </button>
          </div>
        </div>
      `).join('');
    }
  }
}

/**
 * Initialize Sticky Action Bar on Book Detail Page for Mobile
 */
function initBookDetailStickyBar() {
  const stickyBar = document.querySelector('.mobile-sticky-action-bar');
  if (!stickyBar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 200) {
      stickyBar.style.transform = 'translateY(0)';
      stickyBar.style.opacity = '1';
    } else {
      stickyBar.style.transform = 'translateY(100%)';
      stickyBar.style.opacity = '0';
    }
  }, { passive: true });
}

/**
 * Bind read and simulated download buttons
 */
function initMobileReadAndDownloadButtons() {
  document.querySelectorAll('[data-download-book]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = btn.getAttribute('data-download-book') || 'E-Book';
      showToast(`Downloading "${title}" EPUB & PDF...`);
    });
  });
}

/**
 * Toast Notification System
 */
let toastTimeout;
function showToast(message) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'fixed bottom-20 md:bottom-6 right-6 z-50 bg-navy text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-10 opacity-0';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg class="w-5 h-5 text-forest-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
    <span class="text-xs sm:text-sm font-medium">${message}</span>
  `;

  toast.classList.remove('translate-y-10', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 2500);
}
window.showToast = showToast;

function initToastSystem() {
  // Global Toast initialized
}

/**
 * Amazon / Flipkart Style Hero Slider Controller
 */
function initHeroSlider() {
  const slider = document.getElementById('hero-slider');
  if (!slider) return;

  const track = slider.querySelector('.hero-slider-track');
  const slides = slider.querySelectorAll('.hero-slide');
  const dots = slider.querySelectorAll('.slider-dot');
  const prevBtn = slider.querySelector('.slider-arrow-btn.prev');
  const nextBtn = slider.querySelector('.slider-arrow-btn.next');

  if (!track || !slides.length) return;

  let currentSlide = 0;
  const totalSlides = slides.length;
  let autoplayTimer = null;
  const autoplayDelay = 5000;

  function updateSlider(index) {
    if (index < 0) {
      currentSlide = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentSlide = 0;
    } else {
      currentSlide = index;
    }

    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update dots
    dots.forEach((dot, i) => {
      if (i === currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      updateSlider(currentSlide + 1);
    }, autoplayDelay);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // Prev / Next button listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      updateSlider(currentSlide - 1);
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      updateSlider(currentSlide + 1);
      startAutoplay();
    });
  }

  // Dot button listeners
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const slideIndex = parseInt(dot.getAttribute('data-slide-to') || '0', 10);
      updateSlider(slideIndex);
      startAutoplay();
    });
  });

  // Pause on hover
  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  // Touch Swipe Support for Mobile
  let startX = 0;
  let moveX = 0;

  slider.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    stopAutoplay();
  }, { passive: true });

  slider.addEventListener('touchmove', (e) => {
    moveX = e.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener('touchend', () => {
    const diff = startX - moveX;
    if (Math.abs(diff) > 45 && moveX !== 0) {
      if (diff > 0) {
        updateSlider(currentSlide + 1);
      } else {
        updateSlider(currentSlide - 1);
      }
    }
    startX = 0;
    moveX = 0;
    startAutoplay();
  });

  // Start autoplay initial
  startAutoplay();
}

/**
 * Amazon / Flipkart Lightning Deals Live Countdown Timer
 */
function initLightningDealsTimer() {
  const timerElements = document.querySelectorAll('.deal-countdown-timer');
  if (!timerElements.length) return;

  // Set target end time (e.g. 5 hours 42 mins from current session)
  let remainingSeconds = 5 * 3600 + 42 * 60 + 18;

  function updateTimer() {
    remainingSeconds = Math.max(0, remainingSeconds - 1);

    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    const formatted = `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;

    timerElements.forEach((el) => {
      el.textContent = formatted;
    });
  }

  setInterval(updateTimer, 1000);
  updateTimer();
}

/**
 * Amazon / Flipkart Horizontal Product Carousels
 */
function initBookCarousels() {
  const carousels = document.querySelectorAll('.book-carousel-container');
  if (!carousels.length) return;

  carousels.forEach((container) => {
    const track = container.querySelector('.book-carousel-track');
    const prevBtn = container.querySelector('.carousel-nav-btn.prev');
    const nextBtn = container.querySelector('.carousel-nav-btn.next');

    if (!track) return;

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const scrollAmount = track.clientWidth * 0.75;
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const scrollAmount = track.clientWidth * 0.75;
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    }
  });
}

/**
 * Amazon Style Global Search Bar
 */
function initHeaderSearchBar() {
  const searchForms = document.querySelectorAll('.amazon-search-form');
  searchForms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="search"], input[type="text"]');
      const categorySelect = form.querySelector('select');
      const query = input ? input.value.trim() : '';
      const cat = categorySelect ? categorySelect.value : 'all';

      let targetUrl = 'books.html';
      const params = [];
      if (query) params.push(`q=${encodeURIComponent(query)}`);
      if (cat && cat !== 'all') params.push(`cat=${encodeURIComponent(cat)}`);
      if (params.length) {
        targetUrl += '?' + params.join('&');
      }
      window.location.href = targetUrl;
    });
  });
}

/**
 * Render Dynamic Hero Banners and Quad Sections from Firestore
 */
async function initDynamicHomepageContent() {
  if (!window.SocialReadersDB) return;

  // 1. Render Dynamic Hero Banners
  try {
    const track = document.getElementById('hero-slider-track');
    const dotsContainer = document.getElementById('hero-slider-dots');
    if (track && dotsContainer && window.SocialReadersDB.getHeroBanners) {
      const banners = await window.SocialReadersDB.getHeroBanners();
      const activeBanners = (banners || []).filter(b => b.active !== false);

      if (activeBanners.length) {
        track.innerHTML = activeBanners.map((b, i) => `
          <div class="hero-slide cursor-pointer" onclick="window.location.href='${b.linkUrl || 'books.html'}'">
            <img src="${b.imageUrl}" alt="${b.alt || b.title || 'Social Readers Banner'}" ${i === 0 ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async" class="w-full h-full object-cover">
          </div>
        `).join('');

        dotsContainer.innerHTML = activeBanners.map((_, i) => `
          <button type="button" class="slider-dot ${i === 0 ? 'active' : ''}" data-slide-to="${i}" aria-label="Go to slide ${i + 1}"></button>
        `).join('');

        // Re-bind slider listeners
        initHeroSlider();
      }
    }
  } catch (err) {
    console.warn("Could not load dynamic hero banners:", err);
  }

  // 2. Render Dynamic Quad Sections (Tamil Picks, Trending Audiobooks, Self-Help & Mindset)
  try {
    if (window.SocialReadersDB.getQuadSections) {
      const quadData = await window.SocialReadersDB.getQuadSections();
      if (!quadData) return;

      const curLang = (typeof currentLanguage !== 'undefined') ? currentLanguage : (localStorage.getItem('sr_lang') || 'en');

      // Top Picks in Tamil
      if (quadData.tamil_picks) {
        const titleEl = document.getElementById('quad-title-tamil');
        const gridEl = document.getElementById('quad-grid-tamil');
        const linkEl = document.getElementById('quad-link-tamil');

        if (titleEl && (quadData.tamil_picks.titleEn || quadData.tamil_picks.titleTa)) {
          titleEl.textContent = (curLang === 'ta' && quadData.tamil_picks.titleTa) ? quadData.tamil_picks.titleTa : quadData.tamil_picks.titleEn;
        }
        if (linkEl && quadData.tamil_picks.exploreLink) {
          linkEl.href = quadData.tamil_picks.exploreLink;
        }
        if (gridEl && Array.isArray(quadData.tamil_picks.items) && quadData.tamil_picks.items.length) {
          gridEl.innerHTML = quadData.tamil_picks.items.map(item => `
            <a href="${item.linkUrl || `book-detail.html?id=${item.bookId || 'b1'}`}" class="amazon-mini-tile bg-gray-50 rounded-xl p-2 border border-gray-100 flex flex-col items-center text-center group">
              <img src="${item.coverUrl || 'assets/cover-atomic-habits.svg'}" alt="${item.title}" class="w-16 h-20 object-contain rounded-md shadow-xs mb-1">
              <span class="text-[11px] font-bold text-gray-700 group-hover:text-forest line-clamp-1">${item.title}</span>
              <span class="text-[10px] font-black text-forest">${item.price || '₹149'}</span>
            </a>
          `).join('');
        }
      }

      // Trending Audiobooks
      if (quadData.trending_audio) {
        const titleEl = document.getElementById('quad-title-audio');
        const gridEl = document.getElementById('quad-grid-audio');
        const linkEl = document.getElementById('quad-link-audio');

        if (titleEl && (quadData.trending_audio.titleEn || quadData.trending_audio.titleTa)) {
          titleEl.textContent = (curLang === 'ta' && quadData.trending_audio.titleTa) ? quadData.trending_audio.titleTa : quadData.trending_audio.titleEn;
        }
        if (linkEl && quadData.trending_audio.exploreLink) {
          linkEl.href = quadData.trending_audio.exploreLink;
        }
        if (gridEl && Array.isArray(quadData.trending_audio.items) && quadData.trending_audio.items.length) {
          gridEl.innerHTML = quadData.trending_audio.items.map(item => `
            <a href="${item.linkUrl || 'audiobooks.html'}" class="amazon-mini-tile bg-purple-50/50 rounded-xl p-2 border border-purple-100 flex flex-col items-center text-center group">
              <div class="relative">
                <img src="${item.coverUrl || 'assets/cover-atomic-habits.svg'}" alt="${item.title}" class="w-16 h-20 object-contain rounded-md shadow-xs mb-1">
                ${item.duration ? `<span class="absolute bottom-1 right-1 bg-purple-700 text-white text-[8px] font-bold px-1 rounded">${item.duration}</span>` : ''}
              </div>
              <span class="text-[11px] font-bold text-gray-700 group-hover:text-navy line-clamp-1">${item.title}</span>
              <span class="text-[10px] font-black text-purple-700">${item.price || '₹149'}</span>
            </a>
          `).join('');
        }
      }

      // Self-Help & Mindset
      if (quadData.self_help) {
        const titleEl = document.getElementById('quad-title-selfhelp');
        const gridEl = document.getElementById('quad-grid-selfhelp');
        const linkEl = document.getElementById('quad-link-selfhelp');

        if (titleEl && (quadData.self_help.titleEn || quadData.self_help.titleTa)) {
          titleEl.textContent = (curLang === 'ta' && quadData.self_help.titleTa) ? quadData.self_help.titleTa : quadData.self_help.titleEn;
        }
        if (linkEl && quadData.self_help.exploreLink) {
          linkEl.href = quadData.self_help.exploreLink;
        }
        if (gridEl && Array.isArray(quadData.self_help.items) && quadData.self_help.items.length) {
          gridEl.innerHTML = quadData.self_help.items.map(item => `
            <a href="${item.linkUrl || `book-detail.html?id=${item.bookId || 'b1'}`}" class="amazon-mini-tile bg-green-50/40 rounded-xl p-2 border border-green-100 flex flex-col items-center text-center group">
              <img src="${item.coverUrl || 'assets/cover-mindset.svg'}" alt="${item.title}" class="w-16 h-20 object-contain rounded-md shadow-xs mb-1">
              <span class="text-[11px] font-bold text-gray-700 group-hover:text-forest line-clamp-1">${item.title}</span>
              <span class="text-[10px] font-black text-forest">${item.price || '₹149'}</span>
            </a>
          `).join('');
        }
      }
    }
  } catch (err) {
    console.warn("Could not load dynamic quad sections:", err);
  }
}

