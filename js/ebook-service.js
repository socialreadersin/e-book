// Global Utility Helpers
window.SocialReadersUtils = {
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
  stripHtml(str) {
    if (!str) return '';
    return String(str).replace(/<[^>]*>?/gm, '');
  },
  normalizeImageUrl(url) {
    if (!url) return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80';
    const s = String(url).trim();
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:') || s.startsWith('blob:') || s.includes('cloudinary.com')) {
      return s;
    }
    const clean = s.replace(/^\.?\//, '');
    const isSubfolder = (typeof window !== 'undefined' && window.location && window.location.pathname.includes('/admin'));
    if (isSubfolder) {
      return '../' + clean;
    }
    return clean;
  },
  getTitle(book, lang = 'en') {
    if (!book || !book.title) return '';
    if (typeof book.title === 'string') return book.title;
    return (lang === 'ta' && book.title.ta) ? book.title.ta : (book.title.en || '');
  },
  getAuthor(book, lang = 'en') {
    if (!book || !book.author) return '';
    if (typeof book.author === 'string') return book.author;
    return (lang === 'ta' && book.author.ta) ? book.author.ta : (book.author.en || '');
  }
};

const activeFirebaseConfig = (typeof window !== 'undefined' && window.firebaseConfig) 
  ? window.firebaseConfig 
  : {
      apiKey: (typeof window !== 'undefined' && window.__FIREBASE_API_KEY__) || (typeof localStorage !== 'undefined' && (localStorage.getItem('ebook_firebase_api_key') || localStorage.getItem('sr_firebase_api_key'))) || '',
      authDomain: "e-book-7c31a.firebaseapp.com",
      projectId: "e-book-7c31a",
      storageBucket: "e-book-7c31a.firebasestorage.app",
      messagingSenderId: "34774269799",
      appId: "1:34774269799:web:225f344859794de1a139c2",
      measurementId: "G-Y5HDMGDDPR"
    };

// Initialize Firebase if SDK is loaded
var firebaseApp = (typeof window !== 'undefined' && window.firebaseApp) || null;
var firestoreDb = (typeof window !== 'undefined' && window.firebaseDb) || null;
var firebaseAuth = (typeof window !== 'undefined' && window.firebaseAuth) || null;

try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      if (activeFirebaseConfig.apiKey && activeFirebaseConfig.apiKey.length > 10) {
        firebaseApp = firebase.initializeApp(activeFirebaseConfig);
      }
    } else {
      firebaseApp = firebase.app();
    }
    if (firebaseApp) {
      if (!firestoreDb) firestoreDb = firebase.firestore();
      if (!firebaseAuth) firebaseAuth = firebase.auth();
      if (typeof window !== 'undefined') {
        window.firebaseApp = firebaseApp;
        window.firebaseDb = firestoreDb;
        window.firebaseAuth = firebaseAuth;
      }
    }
  }
} catch (err) {
  console.warn("Firebase initialization notice:", err);
}

// Global Firebase / Firestore database wrapper
window.SocialReadersDB = {
  get config() {
    return (typeof window !== 'undefined' && window.firebaseConfig) || activeFirebaseConfig;
  },
  get app() {
    if (typeof window !== 'undefined' && window.firebaseApp) return window.firebaseApp;
    if (firebaseApp) return firebaseApp;
    if (typeof firebase !== 'undefined') {
      if (firebase.apps.length) return firebase.app();
      const cfg = this.config;
      if (cfg && cfg.apiKey && cfg.apiKey.length > 10) {
        try {
          const app = firebase.initializeApp(cfg);
          if (typeof window !== 'undefined') window.firebaseApp = app;
          return app;
        } catch (e) {}
      }
    }
    return null;
  },
  get db() {
    if (typeof window !== 'undefined' && window.firebaseDb) return window.firebaseDb;
    if (firestoreDb) return firestoreDb;
    const app = this.app;
    if (app && typeof firebase !== 'undefined' && firebase.firestore) {
      try {
        const db = firebase.firestore(app);
        if (typeof window !== 'undefined') window.firebaseDb = db;
        return db;
      } catch (e) {}
    }
    return null;
  },
  get auth() {
    if (typeof window !== 'undefined' && window.firebaseAuth) return window.firebaseAuth;
    if (firebaseAuth) return firebaseAuth;
    const app = this.app;
    if (app && typeof firebase !== 'undefined' && firebase.auth) {
      try {
        const auth = firebase.auth(app);
        if (typeof window !== 'undefined') window.firebaseAuth = auth;
        return auth;
      } catch (e) {}
    }
    return null;
  },
  get isLive() {
    return !!this.db;
  },

  // In-memory runtime cache for high-speed synchronous rendering
  _cache: {
    books: null,
    categories: null,
    deals: null,
    stories: null,
    orders: null,
    settings: null
  },

  // -------------------------------------------------------------
  // UNIFIED PERSISTENCE LAYER (LocalStorage + Firestore Two-Way Sync)
  // -------------------------------------------------------------
  STORAGE_KEYS: {
    BOOKS: 'sr_books_data',
    CATEGORIES: 'sr_categories_data',
    DEALS: 'sr_deals_data',
    STORIES: 'sr_stories_data',
    ORDERS: 'sr_orders_data',
    SETTINGS: 'sr_settings_data'
  },

  getLocal(key, fallback = []) {
    if (typeof localStorage === 'undefined') return fallback;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      console.warn(`LocalStorage read error for ${key}:`, e);
      return fallback;
    }
  },

  setLocal(key, value) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Dispatch real-time events for instant UI reactivity across tabs and components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sr_data_synced', { detail: { key, data: value } }));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.warn(`LocalStorage write error for ${key}:`, e);
    }
  },

  normalizeBook(book) {
    if (!book) return book;
    const b = { ...book };
    // Normalize cover image URL — support both coverUrl and coverImageUrl field names
    // Admin uploads save as coverUrl; some older records may use coverImageUrl
    const rawCover = b.coverUrl || b.coverImageUrl || b.imageUrl || '';
    if (rawCover) {
      b.coverUrl = window.SocialReadersUtils.normalizeImageUrl(rawCover);
      b.coverImageUrl = b.coverUrl; // alias for compatibility
    } else {
      b.coverUrl = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80';
      b.coverImageUrl = b.coverUrl;
    }
    // Normalize price fields: explicit price takes precedence
    const resolvedPrice = Number((b.price !== undefined && b.price !== null) ? b.price : (b.priceEbook || 149));
    b.price = resolvedPrice;
    b.priceEbook = resolvedPrice;
    // Normalize status — default to 'published' so books appear on frontend
    if (!b.status) b.status = 'published';
    // Normalize pdfUrl / pdfStoragePath
    if (!b.pdfUrl) b.pdfUrl = b.pdfStoragePath || '';
    return b;
  },

  // -------------------------------------------------------------
  // INITIAL SEED DATA DEFINITIONS (Populated directly into Firestore)
  // -------------------------------------------------------------
  getInitialBooks() {
    return [
      {
        id: "b1",
        title: { en: "Atomic Habits", ta: "அட்டாமிக் ஹாபிட்ஸ்" },
        author: { en: "James Clear", ta: "ஜேம்ஸ் க்ளியர்" },
        priceEbook: 149,
        priceAudiobook: 199,
        price: 149,
        category: "selfdev",
        type: "both",
        isBestseller: true,
        status: "published",
        coverUrl: "assets/cover-atomic-habits.svg",
        pdfUrl: "",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        audioDuration: "5 hrs 35 mins",
        narrator: "James Clear",
        rating: 4.9,
        reviewsCount: 428,
        description: {
          en: "An easy & proven way to build good habits & break bad ones. Transform your daily routine one percent at a time.",
          ta: "நல்ல பழக்கங்களை உருவாக்கவும் கெட்ட பழக்கங்களை அழிக்கவும் நிரூபிக்கப்பட்ட எளிய வழிமுறை."
        },
        createdAt: new Date().toISOString()
      },
      {
        id: "b2",
        title: { en: "The Power of Mindset", ta: "மைண்ட்செட் ஆற்றல்" },
        author: { en: "Carol S. Dweck", ta: "கரோல் எஸ். டுவெக்" },
        priceEbook: 179,
        priceAudiobook: 229,
        price: 179,
        category: "health",
        type: "both",
        isBestseller: false,
        status: "published",
        coverUrl: "assets/cover-mindset.svg",
        pdfUrl: "",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        audioDuration: "6 hrs 12 mins",
        narrator: "Carol S. Dweck",
        rating: 4.8,
        reviewsCount: 312,
        description: {
          en: "Discover how our beliefs about our capabilities shape our success and how fostering a growth mindset changes everything.",
          ta: "நமது எண்ணங்கள் வெற்றியை எவ்வாறு தீர்மானிக்கின்றன என்பதை விளக்கும் அற்புதமான வழிகாட்டி."
        },
        createdAt: new Date().toISOString()
      },
      {
        id: "b3",
        title: { en: "You Can Win", ta: "யு கேன் வின்" },
        author: { en: "Shiv Khera", ta: "ஷிவ் கேரா" },
        priceEbook: 149,
        priceAudiobook: null,
        price: 149,
        category: "selfdev",
        type: "ebook",
        isBestseller: true,
        status: "published",
        coverUrl: "assets/cover-you-can-win.svg",
        pdfUrl: "",
        audioUrl: null,
        rating: 4.9,
        reviewsCount: 520,
        description: {
          en: "A step-by-step tool for top achievers. Winners don't do different things, they do things differently.",
          ta: "வெற்றியாளர்கள் வித்தியாசமான செயல்களைச் செய்வதில்லை, அவர்கள் செயல்களை வித்தியாசமாகச் செய்கிறார்கள்."
        },
        createdAt: new Date().toISOString()
      },
      {
        id: "b4",
        title: { en: "Rich Dad Poor Dad", ta: "ரிச் டாட் புவர் டாட்" },
        author: { en: "Robert Kiyosaki", ta: "ராபர்ட் கியோசாகி" },
        priceEbook: 199,
        priceAudiobook: 249,
        price: 199,
        category: "business",
        type: "both",
        isBestseller: true,
        status: "published",
        coverUrl: "assets/cover-rich-dad.svg",
        pdfUrl: "",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        audioDuration: "6 hrs 45 mins",
        narrator: "Robert Kiyosaki",
        rating: 4.9,
        reviewsCount: 890,
        description: {
          en: "What the rich teach their kids about money that the poor and middle class do not! Master financial independence.",
          ta: "பணம் குறித்து பணக்காரர்கள் தங்கள் குழந்தைகளுக்கு கற்றுக்கொடுக்கும் நிதி மேலாண்மை ரகசியங்கள்."
        },
        createdAt: new Date().toISOString()
      },
      {
        id: "b5",
        title: { en: "Wings of Fire", ta: "அக்னி சிறகுகள்" },
        author: { en: "Dr. A.P.J. Abdul Kalam", ta: "டாக்டர் ஏ.பி.ஜே. அப்துல் கலாம்" },
        priceEbook: 159,
        priceAudiobook: 219,
        price: 159,
        category: "biography",
        type: "both",
        isBestseller: true,
        status: "published",
        coverUrl: "assets/cover-wings-of-fire.svg",
        pdfUrl: "",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        audioDuration: "7 hrs 20 mins",
        narrator: "Girish Karnad",
        rating: 5.0,
        reviewsCount: 1240,
        description: {
          en: "The inspiring autobiography of India's Missile Man and beloved former President, Dr. A.P.J. Abdul Kalam.",
          ta: "இந்தியாவின் ஏவுகணை நாயகன் மற்றும் பாரத ரத்னா டாக்டர் ஏ.பி.ஜே. அப்துல் கலாமின் உத்வேகமூட்டும் வாழ்க்கை வரலாறு."
        },
        createdAt: new Date().toISOString()
      },
      {
        id: "b6",
        title: { en: "Ikigai", ta: "இக்கிகாய்" },
        author: { en: "Héctor García", ta: "ஹெக்டர் கார்சியா" },
        priceEbook: 169,
        priceAudiobook: 229,
        price: 169,
        category: "health",
        type: "audiobook",
        isBestseller: false,
        status: "published",
        coverUrl: "assets/cover-ikigai.svg",
        pdfUrl: "",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        audioDuration: "4 hrs 50 mins",
        narrator: "Héctor García",
        rating: 4.7,
        reviewsCount: 290,
        description: {
          en: "The Japanese secret to a long and happy life. Discover your reason for being and live with purpose.",
          ta: "நீண்ட மற்றும் மகிழ்ச்சியான வாழ்க்கைக்கான ஜப்பானிய ரகசியம். உங்கள் வாழ்க்கையின் நோக்கத்தைக் கண்டறியுங்கள்."
        },
        createdAt: new Date().toISOString()
      },
      {
        id: "b7",
        title: { en: "Deep Work", ta: "டீப் ஒர்க்" },
        author: { en: "Cal Newport", ta: "கால் நியூபோர்ட்" },
        priceEbook: 189,
        priceAudiobook: null,
        price: 189,
        category: "selfdev",
        type: "ebook",
        isBestseller: false,
        status: "published",
        coverUrl: "assets/cover-deep-work.svg",
        pdfUrl: "",
        audioUrl: null,
        rating: 4.8,
        reviewsCount: 380,
        description: {
          en: "Rules for focused success in a distracted world. Master hard things and produce elite quality output quickly.",
          ta: "கவனச்சிதறல்கள் நிறைந்த உலகில் தீவிர கவனத்துடன் சிறப்பான சாதனைகளை படைப்பதற்கான விதிகள்."
        },
        createdAt: new Date().toISOString()
      },
      {
        id: "b8",
        title: { en: "The Psychology of Money", ta: "தி சைக்காலஜி ஆஃப் மணி" },
        author: { en: "Morgan Housel", ta: "மோர்கன் ஹவுசல்" },
        priceEbook: 199,
        priceAudiobook: 249,
        price: 199,
        category: "business",
        type: "both",
        isBestseller: true,
        status: "published",
        coverUrl: "assets/cover-psychology-money.svg",
        pdfUrl: "",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        audioDuration: "5 hrs 40 mins",
        narrator: "Chris Hill",
        rating: 4.9,
        reviewsCount: 650,
        description: {
          en: "Timeless lessons on wealth, greed, and happiness doing well with money isn't necessarily about what you know.",
          ta: "செல்வம், பேராசை மற்றும் மகிழ்ச்சி பற்றிய காலத்தால் அழியாத நிதிக் கொள்கைகள்."
        },
        createdAt: new Date().toISOString()
      }
    ];
  },

  getInitialCategories() {
    return [
      {
        id: "selfdev",
        slug: "self-development",
        name: { en: "Self Development", ta: "சுய முன்னேற்றம்" },
        description: "Actionable guides on habit building, mindset, focus, and life success.",
        status: "active",
        createdAt: new Date().toISOString()
      },
      {
        id: "business",
        slug: "business-finance",
        name: { en: "Business & Finance", ta: "வணிகம் மற்றும் நிதி" },
        description: "Wealth building, investing, entrepreneurship, and economics.",
        status: "active",
        createdAt: new Date().toISOString()
      },
      {
        id: "health",
        slug: "health-mindset",
        name: { en: "Health & Mindset", ta: "ஆரோக்கியம் மற்றும் மனநிலை" },
        description: "Mental resilience, wellness, longevity, and mindfulness.",
        status: "active",
        createdAt: new Date().toISOString()
      },
      {
        id: "biography",
        slug: "biographies",
        name: { en: "Biographies & Memoirs", ta: "சுயசரிதைகள்" },
        description: "Inspiring life journeys of visionary leaders and change-makers.",
        status: "active",
        createdAt: new Date().toISOString()
      },
      {
        id: "fiction",
        slug: "fiction",
        name: { en: "Fiction & Literature", ta: "புனைகதை மற்றும் இலக்கியம்" },
        description: "Classic stories, gripping dramas, and contemporary tales.",
        status: "active",
        createdAt: new Date().toISOString()
      },
      {
        id: "tamil",
        slug: "tamil-classics",
        name: { en: "Tamil Classics & Novels", ta: "தமிழ் நாவல்கள்" },
        description: "Timeless Tamil literary epics and modern serials.",
        status: "active",
        createdAt: new Date().toISOString()
      }
    ];
  },

  getInitialDeals() {
    return [
      {
        id: "d1",
        bookId: "b1",
        title: "Atomic Habits (Audiobook Flash Deal)",
        coverUrl: "assets/cover-atomic-habits.svg",
        originalPrice: 299,
        dealPrice: 149,
        discountPercent: 50,
        startTime: "2026-09-01T00:00:00.000Z",
        endTime: "2026-09-05T23:59:59.000Z",
        status: "active",
        createdAt: new Date().toISOString()
      },
      {
        id: "d2",
        bookId: "b4",
        title: "Rich Dad Poor Dad (Special Promo)",
        coverUrl: "assets/cover-rich-dad.svg",
        originalPrice: 249,
        dealPrice: 159,
        discountPercent: 36,
        startTime: "2026-09-01T00:00:00.000Z",
        endTime: "2026-09-06T23:59:59.000Z",
        status: "active",
        createdAt: new Date().toISOString()
      }
    ];
  },

  getInitialStories() {
    return [
      {
        id: "s1",
        title: { en: "Chronicles of the Chola Horizon", ta: "சோழர் அடிவானத்தின் சரித்திரம்" },
        author: { en: "K. R. Sundaram", ta: "கே. ஆர். சுந்தரம்" },
        genre: "Historical Fiction",
        releaseDay: "Friday",
        coverUrl: "assets/cover-atomic-habits.svg",
        totalEpisodes: 24,
        currentEpisode: 12,
        status: "ongoing",
        description: {
          en: "A gripping epic following seafaring warriors across the Bay of Bengal defending ancient trade routes.",
          ta: "வங்காள விரிகுடாவில் பண்டைய வர்த்தகப் பாதைகளைப் பாதுகாக்கும் கடற்படை வீரர்களின் வீரகதை."
        },
        createdAt: new Date().toISOString()
      },
      {
        id: "s2",
        title: { en: "Whispers of the Nilgiri Mists", ta: "நீலகிரி மூடுபனியின் ரகசியங்கள்" },
        author: { en: "Ananya Sharma", ta: "அனன்யா சர்மா" },
        genre: "Mystery / Thriller",
        releaseDay: "Sunday",
        coverUrl: "assets/cover-mindset.svg",
        totalEpisodes: 16,
        currentEpisode: 8,
        status: "ongoing",
        description: {
          en: "An unsolved disappearance in an isolated tea estate unravels three decades of forgotten secrets.",
          ta: "ஒரு தனிமைப்படுத்தப்பட்ட தேயிலைத் தோட்டத்தில் நடக்கும் புதிரான மர்ம நாவல்."
        },
        createdAt: new Date().toISOString()
      }
    ];
  },

  // -------------------------------------------------------------
  // 1. BOOKS CRUD (Unified LocalStorage + Firestore Two-Way Sync)
  // -------------------------------------------------------------
  async getBooks(includeDrafts = false) {
    // 1. Check LocalStorage for instant synchronous data
    let local = this.getLocal(this.STORAGE_KEYS.BOOKS, null);
    if (!local || !local.length) {
      local = this.getInitialBooks();
      this.setLocal(this.STORAGE_KEYS.BOOKS, local);
    }
    this._cache.books = local;

    // 2. Fetch from Cloud Firestore (Indexless collection query; sort/filter client-side)
    if (this.db) {
      try {
        const snapshot = await this.db.collection('books').get();
        if (!snapshot.empty) {
          const remoteBooks = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            remoteBooks.push(this.normalizeBook({ id: doc.id, ...data }));
          });

          // Two-way merge: remote documents override matching local, while local-only items remain
          const mergedMap = new Map();
          local.forEach(b => mergedMap.set(b.id, this.normalizeBook(b)));
          remoteBooks.forEach(b => mergedMap.set(b.id, { ...mergedMap.get(b.id), ...b }));

          const merged = Array.from(mergedMap.values());
          this._cache.books = merged;
          this.setLocal(this.STORAGE_KEYS.BOOKS, merged);
          local = merged;
        } else if (window.SocialReadersAuth && window.SocialReadersAuth.isAdminAuthenticated()) {
          // Auto-seed initial books into Firestore only if admin is logged in
          await this.seedBooksToFirestore();
        }
      } catch (err) {
        console.warn("Firestore getBooks notice (using localStorage cache):", err.message);
      }
    } else if (window.AppFirebase && typeof window.AppFirebase.getCollection === 'function') {
      try {
        const restDocs = await window.AppFirebase.getCollection('books');
        if (restDocs && restDocs.length) {
          const mergedMap = new Map();
          local.forEach(b => mergedMap.set(b.id, this.normalizeBook(b)));
          restDocs.forEach(b => mergedMap.set(b.id, { ...mergedMap.get(b.id), ...this.normalizeBook(b) }));
          const merged = Array.from(mergedMap.values());
          this._cache.books = merged;
          this.setLocal(this.STORAGE_KEYS.BOOKS, merged);
          local = merged;
        }
      } catch (e) {}
    }

    // 3. Client-side filtering & sorting (Avoids composite index failures)
    let results = local.map(b => this.normalizeBook(b));
    if (!includeDrafts) {
      results = results.filter(b => b.status !== 'draft');
    }
    results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return results;
  },

  getBooksSync(includeDrafts = false) {
    const local = this.getLocal(this.STORAGE_KEYS.BOOKS, this.getInitialBooks());
    const list = (this._cache.books && this._cache.books.length) ? this._cache.books : local;
    const normalized = list.map(b => this.normalizeBook(b));
    return includeDrafts ? normalized : normalized.filter(b => b.status !== 'draft');
  },

  async getBookById(id) {
    if (this.db) {
      try {
        const doc = await this.db.collection('books').doc(id).get();
        if (doc.exists) {
          return this.normalizeBook({ id: doc.id, ...doc.data() });
        }
      } catch (err) {
        console.warn("Firestore getBookById notice:", err.message);
      }
    }
    const books = await this.getBooks(true);
    return books.find(b => b.id === id) || null;
  },

  async saveBook(bookData) {
    const bookId = bookData.id || `b_${Date.now()}`;
    const cleanData = this.normalizeBook({
      ...bookData,
      id: bookId,
      updatedAt: new Date().toISOString(),
      createdAt: bookData.createdAt || new Date().toISOString()
    });

    // 1. Immediately update LocalStorage & Cache (Instant Two-Way Sync)
    let currentBooks = this.getLocal(this.STORAGE_KEYS.BOOKS, this.getInitialBooks());
    const existingIdx = currentBooks.findIndex(b => b.id === bookId);
    if (existingIdx >= 0) {
      currentBooks[existingIdx] = cleanData;
    } else {
      currentBooks.unshift(cleanData);
    }
    this._cache.books = currentBooks;
    this.setLocal(this.STORAGE_KEYS.BOOKS, currentBooks);

    // 2. Cloud Database Upsert (.set with merge: true)
    if (this.db) {
      try {
        await this.db.collection('books').doc(bookId).set(cleanData, { merge: true });
        console.log(`☁️ Book '${bookId}' upserted to Firestore with merge: true`);
      } catch (err) {
        console.error("Firestore saveBook error:", err);
      }
    } else if (window.AppFirebase && typeof window.AppFirebase.updateDocument === 'function') {
      try {
        await window.AppFirebase.updateDocument('books', bookId, cleanData);
      } catch (e) {}
    }

    // 3. Dispatch Live Updates to All Connected Windows & Tabs
    try {
      localStorage.setItem('sr_books_data', JSON.stringify(currentBooks));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sr_catalog_updated', { detail: cleanData }));
        window.dispatchEvent(new CustomEvent('sr_data_synced', { detail: { key: 'sr_books_data' } }));
      }
    } catch (e) {}

    return cleanData;
  },

  async deleteBook(bookId) {
    // 1. Immediately update LocalStorage & Cache
    let currentBooks = this.getLocal(this.STORAGE_KEYS.BOOKS, this.getInitialBooks());
    currentBooks = currentBooks.filter(b => b.id !== bookId);
    this._cache.books = currentBooks;
    this.setLocal(this.STORAGE_KEYS.BOOKS, currentBooks);

    // 2. Cloud Database Delete
    if (this.db) {
      try {
        await this.db.collection('books').doc(bookId).delete();
        console.log(`☁️ Book '${bookId}' deleted from Firestore`);
      } catch (err) {
        console.error("Firestore deleteBook error:", err);
      }
    } else if (window.AppFirebase && typeof window.AppFirebase.deleteDocument === 'function') {
      try {
        await window.AppFirebase.deleteDocument('books', bookId);
      } catch (e) {}
    }

    // 3. Dispatch Live Updates to All Connected Windows & Tabs
    try {
      localStorage.setItem('sr_books_data', JSON.stringify(currentBooks));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sr_catalog_updated', { detail: { id: bookId, deleted: true } }));
        window.dispatchEvent(new CustomEvent('sr_data_synced', { detail: { key: 'sr_books_data' } }));
      }
    } catch (e) {}

    return true;
  },

  async seedBooksToFirestore() {
    if (!this.db) return;
    const initial = this.getInitialBooks();
    const batch = this.db.batch();
    initial.forEach(b => {
      const ref = this.db.collection('books').doc(b.id);
      batch.set(ref, b, { merge: true });
    });
    await batch.commit();
  },

  // -------------------------------------------------------------
  // 2. CATEGORIES CRUD (Unified LocalStorage + Firestore Two-Way Sync)
  // -------------------------------------------------------------
  async getCategories() {
    let local = this.getLocal(this.STORAGE_KEYS.CATEGORIES, null);
    if (!local || !local.length) {
      local = this.getInitialCategories();
      this.setLocal(this.STORAGE_KEYS.CATEGORIES, local);
    }
    this._cache.categories = local;

    if (this.db) {
      try {
        const snapshot = await this.db.collection('categories').get();
        if (!snapshot.empty) {
          const remoteCats = [];
          snapshot.forEach(doc => remoteCats.push({ id: doc.id, ...doc.data() }));

          const mergedMap = new Map();
          local.forEach(c => mergedMap.set(c.id, c));
          remoteCats.forEach(c => mergedMap.set(c.id, { ...mergedMap.get(c.id), ...c }));

          const merged = Array.from(mergedMap.values());
          this._cache.categories = merged;
          this.setLocal(this.STORAGE_KEYS.CATEGORIES, merged);
          local = merged;
        } else if (window.SocialReadersAuth && window.SocialReadersAuth.isAdminAuthenticated()) {
          await this.seedCategoriesToFirestore();
        }
      } catch (err) {
        console.warn("Firestore getCategories notice:", err.message);
      }
    }
    return local;
  },

  async saveCategory(catData) {
    const catId = catData.id || catData.slug || `cat_${Date.now()}`;
    const cleanData = {
      ...catData,
      id: catId,
      updatedAt: new Date().toISOString()
    };

    let current = this.getLocal(this.STORAGE_KEYS.CATEGORIES, this.getInitialCategories());
    const idx = current.findIndex(c => c.id === catId);
    if (idx >= 0) {
      current[idx] = cleanData;
    } else {
      current.push(cleanData);
    }
    this._cache.categories = current;
    this.setLocal(this.STORAGE_KEYS.CATEGORIES, current);

    if (this.db) {
      try {
        await this.db.collection('categories').doc(catId).set(cleanData, { merge: true });
      } catch (err) {
        console.error("Firestore saveCategory error:", err);
      }
    } else if (window.AppFirebase && typeof window.AppFirebase.updateDocument === 'function') {
      try {
        await window.AppFirebase.updateDocument('categories', catId, cleanData);
      } catch (e) {}
    }
    return cleanData;
  },

  async deleteCategory(catId) {
    let current = this.getLocal(this.STORAGE_KEYS.CATEGORIES, this.getInitialCategories());
    current = current.filter(c => c.id !== catId);
    this._cache.categories = current;
    this.setLocal(this.STORAGE_KEYS.CATEGORIES, current);

    if (this.db) {
      try {
        await this.db.collection('categories').doc(catId).delete();
      } catch (err) {
        console.error("Firestore deleteCategory error:", err);
      }
    } else if (window.AppFirebase && typeof window.AppFirebase.deleteDocument === 'function') {
      try {
        await window.AppFirebase.deleteDocument('categories', catId);
      } catch (e) {}
    }
    return true;
  },

  async seedCategoriesToFirestore() {
    if (!this.db) return;
    const initial = this.getInitialCategories();
    const batch = this.db.batch();
    initial.forEach(c => {
      const ref = this.db.collection('categories').doc(c.id);
      batch.set(ref, c, { merge: true });
    });
    await batch.commit();
  },

  // -------------------------------------------------------------
  // 3. LIGHTNING DEALS CRUD (Unified Two-Way Sync)
  // -------------------------------------------------------------
  async getDeals() {
    let local = this.getLocal(this.STORAGE_KEYS.DEALS, null);
    if (!local || !local.length) {
      local = this.getInitialDeals();
      this.setLocal(this.STORAGE_KEYS.DEALS, local);
    }
    this._cache.deals = local;

    if (this.db) {
      try {
        const snapshot = await this.db.collection('deals').get();
        if (!snapshot.empty) {
          const remoteDeals = [];
          snapshot.forEach(doc => remoteDeals.push({ id: doc.id, ...doc.data() }));

          const mergedMap = new Map();
          local.forEach(d => mergedMap.set(d.id, d));
          remoteDeals.forEach(d => mergedMap.set(d.id, { ...mergedMap.get(d.id), ...d }));

          const merged = Array.from(mergedMap.values());
          this._cache.deals = merged;
          this.setLocal(this.STORAGE_KEYS.DEALS, merged);
          local = merged;
        } else if (window.SocialReadersAuth && window.SocialReadersAuth.isAdminAuthenticated()) {
          await this.seedDealsToFirestore();
        }
      } catch (err) {
        console.warn("Firestore getDeals notice:", err.message);
      }
    }
    return local;
  },

  async saveDeal(dealData) {
    const dealId = dealData.id || `deal_${Date.now()}`;
    const cleanData = {
      ...dealData,
      id: dealId,
      updatedAt: new Date().toISOString()
    };

    let current = this.getLocal(this.STORAGE_KEYS.DEALS, this.getInitialDeals());
    const idx = current.findIndex(d => d.id === dealId);
    if (idx >= 0) {
      current[idx] = cleanData;
    } else {
      current.unshift(cleanData);
    }
    this._cache.deals = current;
    this.setLocal(this.STORAGE_KEYS.DEALS, current);

    if (this.db) {
      try {
        await this.db.collection('deals').doc(dealId).set(cleanData, { merge: true });
      } catch (err) {
        console.error("Firestore saveDeal error:", err);
      }
    }
    return cleanData;
  },

  async deleteDeal(dealId) {
    let current = this.getLocal(this.STORAGE_KEYS.DEALS, this.getInitialDeals());
    current = current.filter(d => d.id !== dealId);
    this._cache.deals = current;
    this.setLocal(this.STORAGE_KEYS.DEALS, current);

    if (this.db) {
      try {
        await this.db.collection('deals').doc(dealId).delete();
      } catch (err) {
        console.error("Firestore deleteDeal error:", err);
      }
    }
    return true;
  },

  async seedDealsToFirestore() {
    if (!this.db) return;
    const initial = this.getInitialDeals();
    const batch = this.db.batch();
    initial.forEach(d => {
      const ref = this.db.collection('deals').doc(d.id);
      batch.set(ref, d, { merge: true });
    });
    await batch.commit();
  },

  // -------------------------------------------------------------
  // 4. STORIES CRUD (Unified Two-Way Sync)
  // -------------------------------------------------------------
  async getStories() {
    let local = this.getLocal(this.STORAGE_KEYS.STORIES, null);
    if (!local || !local.length) {
      local = this.getInitialStories();
      this.setLocal(this.STORAGE_KEYS.STORIES, local);
    }
    this._cache.stories = local;

    if (this.db) {
      try {
        const snapshot = await this.db.collection('stories').get();
        if (!snapshot.empty) {
          const remoteStories = [];
          snapshot.forEach(doc => remoteStories.push({ id: doc.id, ...doc.data() }));

          const mergedMap = new Map();
          local.forEach(s => mergedMap.set(s.id, s));
          remoteStories.forEach(s => mergedMap.set(s.id, { ...mergedMap.get(s.id), ...s }));

          const merged = Array.from(mergedMap.values());
          this._cache.stories = merged;
          this.setLocal(this.STORAGE_KEYS.STORIES, merged);
          local = merged;
        } else if (window.SocialReadersAuth && window.SocialReadersAuth.isAdminAuthenticated()) {
          await this.seedStoriesToFirestore();
        }
      } catch (err) {
        console.warn("Firestore getStories notice:", err.message);
      }
    }
    return local;
  },

  async getStoryById(id) {
    const stories = await this.getStories();
    return stories.find(s => s.id === id) || stories[0] || null;
  },

  async saveStory(storyData) {
    const storyId = storyData.id || `story_${Date.now()}`;
    const cleanData = {
      ...storyData,
      id: storyId,
      updatedAt: new Date().toISOString()
    };

    let current = this.getLocal(this.STORAGE_KEYS.STORIES, this.getInitialStories());
    const idx = current.findIndex(s => s.id === storyId);
    if (idx >= 0) {
      current[idx] = cleanData;
    } else {
      current.unshift(cleanData);
    }
    this._cache.stories = current;
    this.setLocal(this.STORAGE_KEYS.STORIES, current);

    if (this.db) {
      try {
        await this.db.collection('stories').doc(storyId).set(cleanData, { merge: true });
      } catch (err) {
        console.error("Firestore saveStory error:", err);
      }
    }
    return cleanData;
  },

  async deleteStory(storyId) {
    let current = this.getLocal(this.STORAGE_KEYS.STORIES, this.getInitialStories());
    current = current.filter(s => s.id !== storyId);
    this._cache.stories = current;
    this.setLocal(this.STORAGE_KEYS.STORIES, current);

    if (this.db) {
      try {
        await this.db.collection('stories').doc(storyId).delete();
      } catch (err) {
        console.error("Firestore deleteStory error:", err);
      }
    }
    return true;
  },

  async seedStoriesToFirestore() {
    if (!this.db) return;
    const initial = this.getInitialStories();
    const batch = this.db.batch();
    initial.forEach(s => {
      const ref = this.db.collection('stories').doc(s.id);
      batch.set(ref, s, { merge: true });
    });
    await batch.commit();
  },

  // -------------------------------------------------------------
  // 5. ORDERS CRUD (Unified LocalStorage + Firestore Two-Way Sync)
  // -------------------------------------------------------------
  async getOrders() {
    let local = this.getLocal(this.STORAGE_KEYS.ORDERS, []);
    this._cache.orders = local;

    if (this.db) {
      try {
        // Indexless collection fetch (client-side sort)
        const snapshot = await this.db.collection('orders').get();
        if (!snapshot.empty) {
          const remoteOrders = [];
          snapshot.forEach(doc => remoteOrders.push({ orderId: doc.id, id: doc.id, ...doc.data() }));

          const mergedMap = new Map();
          local.forEach(o => mergedMap.set(o.orderId || o.id, o));
          remoteOrders.forEach(o => mergedMap.set(o.orderId || o.id, { ...mergedMap.get(o.orderId || o.id), ...o }));

          const merged = Array.from(mergedMap.values());
          merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          this._cache.orders = merged;
          this.setLocal(this.STORAGE_KEYS.ORDERS, merged);
          local = merged;
        }
      } catch (err) {
        console.warn("Firestore getOrders notice:", err.message);
      }
    }
    return local;
  },

  async createOrder(orderData) {
    const orderId = orderData.orderId || orderData.id || `SR-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullOrder = {
      ...orderData,
      id: orderId,
      orderId: orderId,
      status: orderData.status || 'pending',
      createdAt: orderData.createdAt || new Date().toISOString()
    };

    let current = this.getLocal(this.STORAGE_KEYS.ORDERS, []);
    current.unshift(fullOrder);
    this._cache.orders = current;
    this.setLocal(this.STORAGE_KEYS.ORDERS, current);

    if (this.db) {
      try {
        await this.db.collection('orders').doc(orderId).set(fullOrder, { merge: true });
      } catch (err) {
        console.error("Firestore createOrder error:", err);
      }
    } else if (window.AppFirebase && typeof window.AppFirebase.updateDocument === 'function') {
      try {
        await window.AppFirebase.updateDocument('orders', orderId, fullOrder);
      } catch (e) {}
    }
    return fullOrder;
  },

  async updateOrderStatus(orderId, newStatus) {
    let current = this.getLocal(this.STORAGE_KEYS.ORDERS, []);
    const idx = current.findIndex(o => (o.orderId === orderId || o.id === orderId));
    if (idx >= 0) {
      current[idx].status = newStatus;
      current[idx].updatedAt = new Date().toISOString();
      this._cache.orders = current;
      this.setLocal(this.STORAGE_KEYS.ORDERS, current);
    }

    if (this.db) {
      try {
        await this.db.collection('orders').doc(orderId).set({ status: newStatus, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.error("Firestore updateOrderStatus error:", err);
      }
    } else if (window.AppFirebase && typeof window.AppFirebase.updateDocument === 'function') {
      try {
        await window.AppFirebase.updateDocument('orders', orderId, { status: newStatus, updatedAt: new Date().toISOString() });
      } catch (e) {}
    }
    return true;
  },

  async deleteOrder(orderId) {
    let current = this.getLocal(this.STORAGE_KEYS.ORDERS, []);
    current = current.filter(o => (o.orderId !== orderId && o.id !== orderId));
    this._cache.orders = current;
    this.setLocal(this.STORAGE_KEYS.ORDERS, current);

    if (this.db) {
      try {
        await this.db.collection('orders').doc(orderId).delete();
      } catch (err) {
        console.error("Firestore deleteOrder error:", err);
      }
    } else if (window.AppFirebase && typeof window.AppFirebase.deleteDocument === 'function') {
      try {
        await window.AppFirebase.deleteDocument('orders', orderId);
      } catch (e) {}
    }
    return true;
  },
  // Scoped query for a specific customer's orders (avoids full database scan)
  async getUserOrders(customerEmail) {
    if (!customerEmail) return [];
    const normalizedEmail = String(customerEmail).toLowerCase().trim();
    const allOrders = await this.getOrders();
    return allOrders.filter(o => (o.customerEmail || o.buyerEmail || '').toLowerCase().trim() === normalizedEmail);
  },

  getOrdersSync() {
    const local = this.getLocal(this.STORAGE_KEYS.ORDERS, []);
    return (this._cache.orders && this._cache.orders.length) ? this._cache.orders : local;
  },

  // -------------------------------------------------------------
  // 6. STORE SETTINGS (Direct Cloud Firestore document settings/store)
  // -------------------------------------------------------------
  async getSettings() {
    const defaultSettings = {
      cloudinaryCloudName: 'tfy3lcci',
      cloudinaryUploadPreset: 'tfy3lcci',
      causePercentage: 25,
      educationSplit: 15,
      sportsSplit: 10,
      supportEmail: 'support@socialreaders.org'
    };

    if (this.db) {
      try {
        const doc = await this.db.collection('settings').doc('store').get();
        if (doc.exists) {
          const settings = { ...defaultSettings, ...doc.data() };
          this._cache.settings = settings;
          return settings;
        } else if (window.SocialReadersAuth && window.SocialReadersAuth.isAdminAuthenticated()) {
          // Initialize settings doc in Firestore only if admin
          await this.db.collection('settings').doc('store').set(defaultSettings);
          this._cache.settings = defaultSettings;
          return defaultSettings;
        }
      } catch (err) {
        console.warn("Firestore getSettings notice:", err);
      }
    }
    return this._cache.settings || defaultSettings;
  },

  async saveSettings(newSettings) {
    if (this.db) {
      try {
        await this.db.collection('settings').doc('store').set(newSettings, { merge: true });
      } catch (err) {
        console.error("Firestore saveSettings error:", err);
        throw err;
      }
    }
    this._cache.settings = newSettings;
    return newSettings;
  },

  // -------------------------------------------------------------
  // 7. HERO SLIDER BANNERS (Cloud Firestore settings/banners)
  // -------------------------------------------------------------
  getInitialHeroBanners() {
    return [
      {
        id: "banner-1",
        title: "Tamil Classics & Self-Help Editions",
        imageUrl: "assets/hero-banner-tamil.svg",
        linkUrl: "books.html",
        alt: "Tamil Bestselling E-Books and Audiobooks",
        active: true
      },
      {
        id: "banner-2",
        title: "Grand Mega Book Fair & Bestsellers",
        imageUrl: "assets/hero-banner-deal.svg",
        linkUrl: "books.html",
        alt: "Mega Book Fair - Flat 40% - 60% Off",
        active: true
      },
      {
        id: "banner-3",
        title: "25% Direct Youth Education & Sports Impact",
        imageUrl: "assets/hero-banner-cause.svg",
        linkUrl: "impact.html",
        alt: "Read for Change - 25% Social Impact",
        active: true
      },
      {
        id: "banner-4",
        title: "Studio Quality Audiobooks",
        imageUrl: "assets/hero-banner-audio.svg",
        linkUrl: "audiobooks.html",
        alt: "Studio Quality Audiobooks with Audio Sample Player",
        active: true
      }
    ];
  },

  async getHeroBanners() {
    if (this._cache.banners && this._cache.banners.length) {
      return this._cache.banners;
    }
    const initial = this.getInitialHeroBanners();
    if (this.db) {
      try {
        const doc = await this.db.collection('settings').doc('banners').get();
        if (doc.exists && doc.data().banners && Array.isArray(doc.data().banners)) {
          this._cache.banners = doc.data().banners;
          return this._cache.banners;
        } else if (window.SocialReadersAuth && window.SocialReadersAuth.isAdminAuthenticated()) {
          await this.db.collection('settings').doc('banners').set({ banners: initial, updatedAt: new Date().toISOString() });
          this._cache.banners = initial;
          return initial;
        }
      } catch (err) {
        console.warn("Firestore getHeroBanners notice:", err);
      }
    }
    try {
      const stored = localStorage.getItem('sr_hero_banners');
      if (stored) {
        this._cache.banners = JSON.parse(stored);
        return this._cache.banners;
      }
    } catch (e) {}
    this._cache.banners = initial;
    return initial;
  },

  async saveHeroBanners(bannersArray) {
    if (this.db) {
      try {
        await this.db.collection('settings').doc('banners').set({
          banners: bannersArray,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error("Firestore saveHeroBanners error:", err);
        throw err;
      }
    }
    try {
      localStorage.setItem('sr_hero_banners', JSON.stringify(bannersArray));
    } catch (e) {}
    this._cache.banners = bannersArray;
    return bannersArray;
  },

  // -------------------------------------------------------------
  // 8. HOMEPAGE QUAD FEATURE CARDS (Cloud Firestore settings/quad_sections)
  // -------------------------------------------------------------
  getInitialQuadSections() {
    return {
      tamil_picks: {
        titleEn: "Top Picks in Tamil",
        titleTa: "தமிழில் சிறந்த நூல்கள்",
        exploreLink: "books.html",
        items: [
          { bookId: "b5", title: "அக்னி சிறகுகள்", price: "₹159", coverUrl: "assets/cover-wings-of-fire.svg", linkUrl: "book-detail.html?id=b5" },
          { bookId: "b1", title: "அட்டாமிக் ஹாபிட்ஸ்", price: "₹149", coverUrl: "assets/cover-atomic-habits.svg", linkUrl: "book-detail.html?id=b1" },
          { bookId: "b6", title: "இக்கிகாய்", price: "₹169", coverUrl: "assets/cover-ikigai.svg", linkUrl: "book-detail.html?id=b6" },
          { bookId: "b3", title: "யு கேன் வின்", price: "₹149", coverUrl: "assets/cover-you-can-win.svg", linkUrl: "book-detail.html?id=b3" }
        ]
      },
      trending_audio: {
        titleEn: "Trending Audiobooks",
        titleTa: "பிரபலமான ஆடியோபுக்குகள்",
        exploreLink: "audiobooks.html",
        items: [
          { bookId: "b1", title: "Atomic Habits", duration: "5h 35m", price: "₹149", coverUrl: "assets/cover-atomic-habits.svg", linkUrl: "audiobooks.html" },
          { bookId: "b4", title: "Rich Dad", duration: "6h 45m", price: "₹199", coverUrl: "assets/cover-rich-dad.svg", linkUrl: "audiobooks.html" },
          { bookId: "b7", title: "Deep Work", duration: "7h 10m", price: "₹189", coverUrl: "assets/cover-deep-work.svg", linkUrl: "audiobooks.html" },
          { bookId: "b8", title: "Psych of Money", duration: "5h 40m", price: "₹179", coverUrl: "assets/cover-psychology-money.svg", linkUrl: "audiobooks.html" }
        ]
      },
      self_help: {
        titleEn: "Self-Help & Mindset",
        titleTa: "சுய முன்னேற்றம் & மனவலிமை",
        exploreLink: "books.html",
        items: [
          { bookId: "b2", title: "Mindset", price: "₹179", coverUrl: "assets/cover-mindset.svg", linkUrl: "book-detail.html?id=b2" },
          { bookId: "b3", title: "You Can Win", price: "₹149", coverUrl: "assets/cover-you-can-win.svg", linkUrl: "book-detail.html?id=b3" },
          { bookId: "b1", title: "Atomic Habits", price: "₹149", coverUrl: "assets/cover-atomic-habits.svg", linkUrl: "book-detail.html?id=b1" },
          { bookId: "b6", title: "Ikigai", price: "₹169", coverUrl: "assets/cover-ikigai.svg", linkUrl: "book-detail.html?id=b6" }
        ]
      }
    };
  },

  async getQuadSections() {
    if (this._cache.quadSections) {
      return this._cache.quadSections;
    }
    const initial = this.getInitialQuadSections();
    if (this.db) {
      try {
        const doc = await this.db.collection('settings').doc('quad_sections').get();
        if (doc.exists && doc.data()) {
          const loaded = { ...initial, ...doc.data() };
          this._cache.quadSections = loaded;
          return loaded;
        } else if (window.SocialReadersAuth && window.SocialReadersAuth.isAdminAuthenticated()) {
          await this.db.collection('settings').doc('quad_sections').set({ ...initial, updatedAt: new Date().toISOString() });
          this._cache.quadSections = initial;
          return initial;
        }
      } catch (err) {
        console.warn("Firestore getQuadSections notice:", err);
      }
    }
    try {
      const stored = localStorage.getItem('sr_quad_sections');
      if (stored) {
        this._cache.quadSections = JSON.parse(stored);
        return this._cache.quadSections;
      }
    } catch (e) {}
    this._cache.quadSections = initial;
    return initial;
  },

  async saveQuadSections(quadData) {
    if (this.db) {
      try {
        await this.db.collection('settings').doc('quad_sections').set({
          ...quadData,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error("Firestore saveQuadSections error:", err);
        throw err;
      }
    }
    try {
      localStorage.setItem('sr_quad_sections', JSON.stringify(quadData));
    } catch (e) {}
    this._cache.quadSections = quadData;
    return quadData;
  },

  async seedDemoData() {
    if (this.db) {
      await Promise.all([
        this.seedBooksToFirestore(),
        this.seedCategoriesToFirestore(),
        this.seedDealsToFirestore(),
        this.seedStoriesToFirestore()
      ]);
    }
    const books = await this.getBooks(true);
    return { success: true, count: books.length };
  },

  // -------------------------------------------------------------
  // 9. USER LIBRARY / ENTITLEMENT SYSTEM
  // Source of truth: Firestore `userEntitlements/{userId}`
  // Written by Cloud Functions after verified payment.
  // Client can also write via grantLibraryAccess() for sandbox/test mode.
  // -------------------------------------------------------------

  /**
   * Fetch the current user's purchased book entitlements from Firestore.
   * Returns array of { bookId, orderId, purchasedAt, format, ... }
   */
  async getUserLibrary(userId) {
    if (!userId) return [];

    // 1. Try Firestore userEntitlements collection (written by Cloud Functions)
    if (this.db) {
      try {
        const doc = await this.db.collection('userEntitlements').doc(userId).get();
        if (doc.exists) {
          const data = doc.data();
          const books = data.books || data;
          // Convert map { bookId: { purchasedAt, orderId, format } } to array
          const entries = [];
          for (const [bookId, meta] of Object.entries(books)) {
            if (bookId === 'updatedAt') continue;
            entries.push({
              bookId,
              orderId: meta.orderId || '',
              purchasedAt: meta.purchasedAt || meta.createdAt || new Date().toISOString(),
              format: meta.format || 'ebook',
              accessStatus: meta.accessStatus || 'active'
            });
          }
          // Cache locally
          try { localStorage.setItem(`sr_library_${userId}`, JSON.stringify(entries)); } catch (e) {}
          return entries;
        }
      } catch (err) {
        console.warn('getUserLibrary Firestore notice:', err.message);
      }
    }

    // 2. Fall back to local cache (works offline / without Cloud Functions)
    try {
      const cached = localStorage.getItem(`sr_library_${userId}`);
      if (cached) return JSON.parse(cached);
    } catch (e) {}

    // 3. Fall back to matching completed orders by userId
    try {
      const orders = this.getOrdersSync();
      const userOrders = orders.filter(o =>
        (o.userId === userId || o.uid === userId) &&
        (o.status === 'completed' || o.status === 'PAID' || o.testMode)
      );
      return userOrders.map(o => ({
        bookId: o.bookId,
        orderId: o.orderId || o.id,
        purchasedAt: o.createdAt || new Date().toISOString(),
        format: o.format || 'ebook',
        accessStatus: 'active'
      }));
    } catch (e) {}

    return [];
  },

  /**
   * Grant library access for a book after successful payment.
   * Called client-side in sandbox/test mode.
   * In production, Cloud Functions write this via Admin SDK.
   * Uses merge so duplicate calls are idempotent.
   */
  async grantLibraryAccess(userId, bookId, orderId, format = 'ebook') {
    if (!userId || !bookId) return false;

    const now = new Date().toISOString();
    const entry = {
      bookId,
      orderId: orderId || '',
      purchasedAt: now,
      format: format || 'ebook',
      accessStatus: 'active'
    };

    // ── ReadMate-inspired triple-write pattern ────────────────────────────────
    // Approach matches ReadMate's FirestorePaymentService.buyBook() exactly,
    // adapted for web + our existing userEntitlements schema.
    if (this.db) {
      try {
        const writes = [];

        // Write A: userEntitlements/{uid} — our primary entitlement doc (merge)
        writes.push(
          this.db.collection('userEntitlements').doc(userId).set({
            [`books.${bookId}`]: {
              purchasedAt: entry.purchasedAt,
              format: entry.format,
              orderId: entry.orderId,
              accessStatus: 'active'
            }
          }, { merge: true })
        );

        // Write B: users/{uid}.books[] — ReadMate's fast ownership check array
        // (FieldValue.arrayUnion equivalent for web SDK v9 compat)
        writes.push(
          this.db.collection('users').doc(userId).set({
            books: firebase.firestore.FieldValue.arrayUnion(bookId),
            lastPurchaseAt: now
          }, { merge: true })
        );

        // Write C: users/{uid}/myBooks/{bookId} — ReadMate's rich subcollection
        // Full book entry stored for offline access & cross-device sync
        writes.push(
          this.db.collection('users').doc(userId)
            .collection('myBooks').doc(bookId)
            .set({
              bookId,
              orderId: orderId || '',
              format: format || 'ebook',
              purchasedAt: now,
              accessStatus: 'active'
            }, { merge: true })
        );

        await Promise.allSettled(writes);
        console.log(`Library access granted (triple-write): user=${userId} book=${bookId}`);
      } catch (err) {
        // Firestore rules prevent client write in production — handled by Cloud Functions
        console.warn('grantLibraryAccess Firestore notice (expected in production):', err.message);
      }
    }

    // 2. Always update local cache (instant UI feedback)
    try {
      const cached = localStorage.getItem(`sr_library_${userId}`);
      const entries = cached ? JSON.parse(cached) : [];
      const existing = entries.findIndex(e => e.bookId === bookId);
      if (existing >= 0) {
        entries[existing] = entry;
      } else {
        entries.unshift(entry);
      }
      localStorage.setItem(`sr_library_${userId}`, JSON.stringify(entries));
    } catch (e) {}

    return true;
  },

  /**
   * Check if a user owns a specific book.
   * Fast-path: checks users/{uid}.books[] array (ReadMate pattern) before full library scan.
   */
  async userOwnsBook(userId, bookId) {
    if (!userId || !bookId) return false;
    // Fast path: check users/{uid}.books[] first (ReadMate pattern)
    if (this.db) {
      try {
        const userDoc = await this.db.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const booksArray = userDoc.data().books || [];
          if (booksArray.includes(bookId)) return true;
        }
      } catch(e) {}
    }
    // Fallback: full library scan
    const library = await this.getUserLibrary(userId);
    return library.some(item => item.bookId === bookId && item.accessStatus !== 'revoked');
  },

  /**
   * Get user profile from Firestore (users/{uid}) — ReadMate's getUserProfile() equivalent.
   * Falls back to localStorage session.
   */
  async getUserProfile(userId) {
    if (!userId) return null;
    if (this.db) {
      try {
        const doc = await this.db.collection('users').doc(userId).get();
        if (doc.exists) return { uid: userId, ...doc.data() };
      } catch(e) {}
    }
    // localStorage fallback
    try {
      const session = JSON.parse(localStorage.getItem('sr_user_auth') || 'null');
      if (session && session.uid === userId) return session;
    } catch(e) {}
    return null;
  },

  /**
   * Add a book to the user's wishlist (ReadMate's Bookcase pattern).
   * Writes to: users/{uid}/bookcase/{bookId}
   */
  async addToWishlist(userId, bookId) {
    if (!userId || !bookId) return false;
    const entry = { bookId, savedAt: new Date().toISOString() };

    // Firestore write
    if (this.db) {
      try {
        await this.db.collection('users').doc(userId)
          .collection('bookcase').doc(bookId)
          .set(entry, { merge: true });
      } catch(e) {
        console.warn('addToWishlist Firestore error:', e.message);
      }
    }

    // localStorage mirror
    try {
      const key = `sr_wishlist_${userId}`;
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      if (!list.find(i => i.bookId === bookId)) list.unshift(entry);
      localStorage.setItem(key, JSON.stringify(list));
    } catch(e) {}
    return true;
  },

  /**
   * Remove a book from wishlist.
   */
  async removeFromWishlist(userId, bookId) {
    if (!userId || !bookId) return false;
    if (this.db) {
      try {
        await this.db.collection('users').doc(userId)
          .collection('bookcase').doc(bookId).delete();
      } catch(e) {}
    }
    try {
      const key = `sr_wishlist_${userId}`;
      const list = JSON.parse(localStorage.getItem(key) || '[]').filter(i => i.bookId !== bookId);
      localStorage.setItem(key, JSON.stringify(list));
    } catch(e) {}
    return true;
  },

  /**
   * Get wishlist for a user — reads users/{uid}/bookcase/ subcollection.
   * Falls back to localStorage.
   */
  async getUserWishlist(userId) {
    if (!userId) return [];
    if (this.db) {
      try {
        const snap = await this.db.collection('users').doc(userId)
          .collection('bookcase').orderBy('savedAt', 'desc').get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ ...d.data(), bookId: d.id }));
        }
      } catch(e) {}
    }
    // localStorage fallback
    try {
      return JSON.parse(localStorage.getItem(`sr_wishlist_${userId}`) || '[]');
    } catch(e) { return []; }
  },

  // Master Initializer
  async init() {
    try {
      await Promise.allSettled([
        this.getBooks(),
        this.getCategories(),
        this.getDeals(),
        this.getStories(),
        this.getSettings()
      ]);
    } catch (e) {
      console.warn("SocialReadersDB pre-fetch completed.");
    }
  }
};

// Initialize pre-fetch on script load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.SocialReadersDB.init();
  });
}
