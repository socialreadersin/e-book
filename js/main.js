/**
 * Social Readers - Main Application Logic
 * Navigation, Tab Switching, Wishlist Toggle & Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // Highlight active nav links based on current path
  highlightActiveNav();

  // Initialize interactive components
  initWishlistButtons();
  initCategoryFilters();
  initAccountTabs();
  initToastSystem();
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
 * Interactive Wishlist button toggle
 */
function initWishlistButtons() {
  document.querySelectorAll('.wishlist-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const heartIcon = btn.querySelector('svg');
      const isFilled = btn.getAttribute('data-liked') === 'true';

      if (isFilled) {
        btn.setAttribute('data-liked', 'false');
        heartIcon.setAttribute('fill', 'none');
        heartIcon.setAttribute('stroke', '#E8720C');
        showToast('Removed from Wishlist');
      } else {
        btn.setAttribute('data-liked', 'true');
        heartIcon.setAttribute('fill', '#E8720C');
        heartIcon.setAttribute('stroke', '#E8720C');
        btn.classList.add('scale-125');
        setTimeout(() => btn.classList.remove('scale-125'), 200);
        showToast('Added to Wishlist ❤️');
      }
    });
  });
}

/**
 * Filter books by category in books.html
 */
function initCategoryFilters() {
  const filterBtns = document.querySelectorAll('.category-filter-btn');
  const bookCards = document.querySelectorAll('.catalog-book-card');

  if (!filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedCategory = btn.getAttribute('data-category');

      // Update active button styling
      filterBtns.forEach((b) => {
        b.classList.remove('bg-navy', 'text-white');
        b.classList.add('bg-white', 'text-navy', 'border', 'border-gray-200');
      });
      btn.classList.add('bg-navy', 'text-white');
      btn.classList.remove('bg-white', 'text-navy', 'border', 'border-gray-200');

      // Filter visible books
      bookCards.forEach((card) => {
        const cardCat = card.getAttribute('data-category');
        if (selectedCategory === 'all' || cardCat === selectedCategory) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Search input filter for books
  const searchInput = document.getElementById('bookSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      bookCards.forEach((card) => {
        const title = card.querySelector('.book-title')?.textContent.toLowerCase() || '';
        const author = card.querySelector('.book-author')?.textContent.toLowerCase() || '';
        if (title.includes(term) || author.includes(term)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
}

/**
 * Tab switching in account.html
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
        b.classList.remove('border-forest-green', 'text-navy', 'font-bold');
        b.classList.add('border-transparent', 'text-gray-500');
      });
      btn.classList.add('border-forest-green', 'text-navy', 'font-bold');
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
    <svg class="w-5 h-5 text-forest-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
    <span class="text-sm font-medium">${message}</span>
  `;

  toast.classList.remove('translate-y-10', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 2500);
}
