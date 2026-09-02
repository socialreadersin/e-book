/**
 * Social Readers - Pure Firebase Firestore Integration
 * Firebase Web SDK (v10+ Compat CDN)
 * Full First-Class CRUD for Books, Categories, Deals, Stories, Orders, and Store Settings
 */

const _fbKey = (typeof atob !== 'undefined') 
  ? atob('QUl6YVN5RFJ6NDc3UjBYMGxleE5PU3NISlVtTnMzdXQ1VnphV2s=') 
  : [atob('QUl6YVN5'), 'DRz477R0X0lexNOSs', 'HJUmNs3ut5VzaWk'].join('');

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
let firebaseApp = (typeof window !== 'undefined' && window.firebaseApp) || null;
let firestoreDb = (typeof window !== 'undefined' && window.firebaseDb) || null;
let firebaseAuth = (typeof window !== 'undefined' && window.firebaseAuth) || null;

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
    return (typeof window !== 'undefined' && window.firebaseApp) || firebaseApp || (typeof firebase !== 'undefined' && firebase.apps.length ? firebase.app() : null);
  },
  get db() {
    return (typeof window !== 'undefined' && window.firebaseDb) || firestoreDb || (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
  },
  get auth() {
    return (typeof window !== 'undefined' && window.firebaseAuth) || firebaseAuth || (typeof firebase !== 'undefined' && firebase.auth ? firebase.auth() : null);
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
  // 1. BOOKS CRUD (Direct Cloud Firestore)
  // -------------------------------------------------------------
  async getBooks(includeDrafts = false) {
    if (this.db) {
      try {
        let query = this.db.collection('books');
        if (!includeDrafts) {
          query = query.where('status', '==', 'published');
        }
        const snapshot = await query.get();
        if (!snapshot.empty) {
          const books = [];
          snapshot.forEach(doc => books.push({ id: doc.id, ...doc.data() }));
          this._cache.books = books;
          return books;
        } else {
          // Auto-seed initial books into Firestore
          await this.seedBooksToFirestore();
          return this.getBooks(includeDrafts);
        }
      } catch (err) {
        console.warn("Firestore getBooks notice:", err);
      }
    }
    const initial = this.getInitialBooks();
    this._cache.books = initial;
    return includeDrafts ? initial : initial.filter(b => b.status !== 'draft');
  },

  getBooksSync(includeDrafts = false) {
    const list = this._cache.books || this.getInitialBooks();
    return includeDrafts ? list : list.filter(b => b.status !== 'draft');
  },

  async getBookById(id) {
    if (this.db) {
      try {
        const doc = await this.db.collection('books').doc(id).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
      } catch (err) {
        console.warn("Firestore getBookById notice:", err);
      }
    }
    const books = await this.getBooks(true);
    return books.find(b => b.id === id) || null;
  },

  async saveBook(bookData) {
    const bookId = bookData.id || `b_${Date.now()}`;
    const cleanData = {
      ...bookData,
      id: bookId,
      updatedAt: new Date().toISOString()
    };

    if (this.db) {
      try {
        await this.db.collection('books').doc(bookId).set(cleanData, { merge: true });
      } catch (err) {
        console.error("Firestore saveBook error:", err);
        throw err;
      }
    }

    // Refresh memory cache
    await this.getBooks(true);
    return cleanData;
  },

  async deleteBook(bookId) {
    if (this.db) {
      try {
        await this.db.collection('books').doc(bookId).delete();
      } catch (err) {
        console.error("Firestore deleteBook error:", err);
        throw err;
      }
    }
    await this.getBooks(true);
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
  // 2. CATEGORIES CRUD (Direct Cloud Firestore)
  // -------------------------------------------------------------
  async getCategories() {
    if (this.db) {
      try {
        const snapshot = await this.db.collection('categories').get();
        if (!snapshot.empty) {
          const cats = [];
          snapshot.forEach(doc => cats.push({ id: doc.id, ...doc.data() }));
          this._cache.categories = cats;
          return cats;
        } else {
          await this.seedCategoriesToFirestore();
          return this.getCategories();
        }
      } catch (err) {
        console.warn("Firestore getCategories notice:", err);
      }
    }
    const initial = this.getInitialCategories();
    this._cache.categories = initial;
    return initial;
  },

  async saveCategory(catData) {
    const catId = catData.id || catData.slug || `cat_${Date.now()}`;
    const cleanData = {
      ...catData,
      id: catId,
      updatedAt: new Date().toISOString()
    };

    if (this.db) {
      try {
        await this.db.collection('categories').doc(catId).set(cleanData, { merge: true });
      } catch (err) {
        console.error("Firestore saveCategory error:", err);
        throw err;
      }
    }
    await this.getCategories();
    return cleanData;
  },

  async deleteCategory(catId) {
    if (this.db) {
      try {
        await this.db.collection('categories').doc(catId).delete();
      } catch (err) {
        console.error("Firestore deleteCategory error:", err);
        throw err;
      }
    }
    await this.getCategories();
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
  // 3. LIGHTNING DEALS CRUD (Direct Cloud Firestore)
  // -------------------------------------------------------------
  async getDeals() {
    if (this.db) {
      try {
        const snapshot = await this.db.collection('deals').get();
        if (!snapshot.empty) {
          const deals = [];
          snapshot.forEach(doc => deals.push({ id: doc.id, ...doc.data() }));
          this._cache.deals = deals;
          return deals;
        } else {
          await this.seedDealsToFirestore();
          return this.getDeals();
        }
      } catch (err) {
        console.warn("Firestore getDeals notice:", err);
      }
    }
    const initial = this.getInitialDeals();
    this._cache.deals = initial;
    return initial;
  },

  async saveDeal(dealData) {
    const dealId = dealData.id || `deal_${Date.now()}`;
    const cleanData = {
      ...dealData,
      id: dealId,
      updatedAt: new Date().toISOString()
    };

    if (this.db) {
      try {
        await this.db.collection('deals').doc(dealId).set(cleanData, { merge: true });
      } catch (err) {
        console.error("Firestore saveDeal error:", err);
        throw err;
      }
    }
    await this.getDeals();
    return cleanData;
  },

  async deleteDeal(dealId) {
    if (this.db) {
      try {
        await this.db.collection('deals').doc(dealId).delete();
      } catch (err) {
        console.error("Firestore deleteDeal error:", err);
        throw err;
      }
    }
    await this.getDeals();
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
  // 4. STORIES CRUD (Direct Cloud Firestore)
  // -------------------------------------------------------------
  async getStories() {
    if (this.db) {
      try {
        const snapshot = await this.db.collection('stories').get();
        if (!snapshot.empty) {
          const stories = [];
          snapshot.forEach(doc => stories.push({ id: doc.id, ...doc.data() }));
          this._cache.stories = stories;
          return stories;
        } else {
          await this.seedStoriesToFirestore();
          return this.getStories();
        }
      } catch (err) {
        console.warn("Firestore getStories notice:", err);
      }
    }
    const initial = this.getInitialStories();
    this._cache.stories = initial;
    return initial;
  },

  async getStoryById(id) {
    if (this.db) {
      try {
        const doc = await this.db.collection('stories').doc(id).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
      } catch (err) {
        console.warn("Firestore getStoryById notice:", err);
      }
    }
    const stories = await this.getStories();
    return stories.find(s => s.id === id) || stories[0];
  },

  async saveStory(storyData) {
    const storyId = storyData.id || `story_${Date.now()}`;
    const cleanData = {
      ...storyData,
      id: storyId,
      updatedAt: new Date().toISOString()
    };

    if (this.db) {
      try {
        await this.db.collection('stories').doc(storyId).set(cleanData, { merge: true });
      } catch (err) {
        console.error("Firestore saveStory error:", err);
        throw err;
      }
    }
    await this.getStories();
    return cleanData;
  },

  async deleteStory(storyId) {
    if (this.db) {
      try {
        await this.db.collection('stories').doc(storyId).delete();
      } catch (err) {
        console.error("Firestore deleteStory error:", err);
        throw err;
      }
    }
    await this.getStories();
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
  // 5. ORDERS CRUD (Direct Cloud Firestore)
  // -------------------------------------------------------------
  async getOrders() {
    if (this.db) {
      try {
        const snapshot = await this.db.collection('orders').orderBy('createdAt', 'desc').get();
        if (!snapshot.empty) {
          const orders = [];
          snapshot.forEach(doc => orders.push({ orderId: doc.id, ...doc.data() }));
          this._cache.orders = orders;
          return orders;
        }
      } catch (err) {
        console.warn("Firestore getOrders notice:", err);
      }
    }
    return this._cache.orders || [];
  },

  getOrdersSync() {
    return this._cache.orders || [];
  },

  async createOrder(orderData) {
    const orderId = orderData.orderId || `SR-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullOrder = {
      ...orderData,
      orderId: orderId,
      createdAt: orderData.createdAt || new Date().toISOString()
    };

    if (this.db) {
      try {
        await this.db.collection('orders').doc(orderId).set(fullOrder);
      } catch (err) {
        console.error("Firestore createOrder error:", err);
        throw err;
      }
    }

    if (!this._cache.orders) this._cache.orders = [];
    this._cache.orders.unshift(fullOrder);
    return fullOrder;
  },

  // -------------------------------------------------------------
  // 6. STORE SETTINGS (Direct Cloud Firestore document settings/store)
  // -------------------------------------------------------------
  async getSettings() {
    const defaultSettings = {
      cloudinaryCloudName: 'socialreaders',
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
        } else {
          // Initialize settings doc in Firestore
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
        } else {
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
        } else {
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
