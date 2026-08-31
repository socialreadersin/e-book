/**
 * Social Readers - Main Application Logic
 * Navigation, Tab Switching, Wishlist, Category & Format Filters, Reader & Audio hooks
 */

document.addEventListener('DOMContentLoaded', () => {
  // Highlight active nav links based on current path
  highlightActiveNav();

  // Initialize interactive components
  initHeroSlider();
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
    savedWishlist = JSON.parse(localStorage.getItem('sr_wishlist')) || ['b5', 'b6'];
  } catch(e) {
    savedWishlist = ['b5', 'b6'];
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
 */
function renderDynamicAccountData() {
  if (!window.SocialReadersDB) return;

  const orders = window.SocialReadersDB.getOrders();
  if (!orders || !orders.length) return;

  // Calculate totals
  let totalFund = 0;
  orders.forEach(o => {
    totalFund += (Number(o.causeShare) || (o.amount * 0.25) || 0);
  });

  // Update contribution callouts
  const impactMetricEl = document.querySelector('[data-i18n="account.impact_metric"]');
  if (impactMetricEl) {
    impactMetricEl.textContent = `You contributed ₹${totalFund.toFixed(2)} to youth so far!`;
  }

  const statFundEl = document.getElementById('account-total-fund-stat');
  if (statFundEl) {
    statFundEl.textContent = `₹${totalFund.toFixed(2)}`;
  }

  // Update textbooks count (approx 1 textbook per ₹75)
  const textbooksCountEl = document.getElementById('account-textbooks-stat');
  if (textbooksCountEl) {
    textbooksCountEl.textContent = Math.max(1, Math.floor(totalFund / 75));
  }

  // Render Orders Table
  const ordersTbody = document.getElementById('account-orders-tbody');
  if (ordersTbody) {
    ordersTbody.innerHTML = orders.map(ord => `
      <tr class="hover:bg-gray-50/75 transition-colors">
        <td class="p-3 sm:p-4 font-mono font-bold text-navy">${ord.orderId || '#SR-9800'}</td>
        <td class="p-3 sm:p-4">
          <div class="font-semibold text-gray-800">${ord.bookTitle}</div>
          <div class="text-[11px] text-forest font-medium">${ord.format || 'E-Book'}</div>
        </td>
        <td class="p-3 sm:p-4 text-xs text-gray-500 whitespace-nowrap">${ord.date || 'Today'}</td>
        <td class="p-3 sm:p-4 font-bold text-navy whitespace-nowrap">₹${ord.amount}.00</td>
        <td class="p-3 sm:p-4 font-bold text-brandOrange whitespace-nowrap">₹${Number(ord.causeShare).toFixed(2)}</td>
        <td class="p-3 sm:p-4">
          <button type="button" onclick="showToast('Downloading invoice ${ord.orderId} PDF...')" class="inline-flex items-center gap-1 text-navy hover:text-forest font-bold text-xs underline">
            <span>Receipt</span>
          </button>
        </td>
      </tr>
    `).join('');
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

