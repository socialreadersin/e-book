/**
 * Social Readers - Real Firebase Configuration & Firestore Integration
 * Firebase Web SDK (v10+ Compat CDN)
 * Supports Cloud Firestore, Firebase Auth, and Store Settings
 */

const firebaseConfig = {
  apiKey: localStorage.getItem('sr_firebase_api_key') || "AIzaSyDRz477R0X0lexNOSsHZiUmNs3ut5VzaWk",
  authDomain: localStorage.getItem('sr_firebase_auth_domain') || "e-book-7c31a.firebaseapp.com",
  projectId: localStorage.getItem('sr_firebase_project_id') || "e-book-7c31a",
  storageBucket: localStorage.getItem('sr_firebase_storage_bucket') || "e-book-7c31a.firebasestorage.app",
  messagingSenderId: "34774269799",
  appId: "1:34774269799:web:225f344859794de1a139c2",
  measurementId: "G-Y5HDMGDDPR"
};

// Initialize Firebase if SDK is loaded
let firebaseApp = null;
let firestoreDb = null;
let firebaseAuth = null;

try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
      firebaseApp = firebase.app();
    }
    firestoreDb = firebase.firestore();
    firebaseAuth = firebase.auth();
  }
} catch (err) {
  console.warn("Firebase initialization warning (running in resilience mode):", err);
}

// Global Firebase / Firestore database wrapper
window.SocialReadersDB = {
  config: firebaseConfig,
  app: firebaseApp,
  db: firestoreDb,
  auth: firebaseAuth,
  isLive: !!firestoreDb,

  // Initial seed data for books
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
          en: "An inspiring autobiography of an ordinary boy from Rameswaram who went on to become the Missile Man of India.",
          ta: "ராமேஸ்வரத்தில் பிறந்து இந்தியாவின் ஏவுகணை மனிதராக உயர்ந்த ஒரு மாமனிதரின் உத்வேக சுயசரிதை."
        },
        createdAt: new Date().toISOString()
      },
      {
        id: "b6",
        title: { en: "Ikigai: The Japanese Secret", ta: "இக்கிகாய்" },
        author: { en: "Héctor García & F. Miralles", ta: "ஹெக்டர் கார்சியா" },
        priceEbook: 169,
        priceAudiobook: 199,
        price: 169,
        category: "health",
        type: "audiobook",
        isBestseller: false,
        status: "published",
        coverUrl: "assets/cover-ikigai.svg",
        pdfUrl: "",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        audioDuration: "3 hrs 50 mins",
        narrator: "Naoko Mori",
        rating: 4.7,
        reviewsCount: 260,
        description: {
          en: "The Japanese secret to a long, happy and purposeful life. Discover your reason for getting up every morning.",
          ta: "நீண்ட மற்றும் மகிழ்ச்சியான வாழ்விற்கான ஜப்பானிய ரகசியம். வாழ்வின் நோக்கத்தைக் கண்டறியுங்கள்."
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

  // Fetch all books (async with Firestore, falls back to local cache)
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
          snapshot.forEach(doc => {
            books.push({ id: doc.id, ...doc.data() });
          });
          localStorage.setItem('sr_books', JSON.stringify(books));
          return books;
        }
      } catch (err) {
        console.warn("Firestore fetchBooks error, using cached data:", err);
      }
    }

    // Fallback to localStorage or seed
    const saved = localStorage.getItem('sr_books');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return includeDrafts ? parsed : parsed.filter(b => b.status !== 'draft');
      } catch (e) {
        console.error(e);
      }
    }
    const initial = this.getInitialBooks();
    localStorage.setItem('sr_books', JSON.stringify(initial));
    return includeDrafts ? initial : initial.filter(b => b.status !== 'draft');
  },

  // Synchronous getter for legacy UI renderers
  getBooksSync(includeDrafts = false) {
    const saved = localStorage.getItem('sr_books');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return includeDrafts ? parsed : parsed.filter(b => b.status !== 'draft');
      } catch (e) {
        console.error(e);
      }
    }
    const initial = this.getInitialBooks();
    localStorage.setItem('sr_books', JSON.stringify(initial));
    return includeDrafts ? initial : initial.filter(b => b.status !== 'draft');
  },

  // Fetch single book by ID
  async getBookById(id) {
    if (this.db) {
      try {
        const doc = await this.db.collection('books').doc(id).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
      } catch (err) {
        console.warn("Firestore getBookById error, falling back:", err);
      }
    }
    const books = this.getBooksSync(true);
    return books.find(b => b.id === id) || books[0];
  },

  // Save book (create or update in Firestore & local cache)
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
        console.warn("Firestore saveBook error (persisting locally):", err);
      }
    }

    // Update local cache
    const currentBooks = this.getBooksSync(true);
    const existingIndex = currentBooks.findIndex(b => b.id === bookId);
    if (existingIndex >= 0) {
      currentBooks[existingIndex] = cleanData;
    } else {
      currentBooks.unshift(cleanData);
    }
    localStorage.setItem('sr_books', JSON.stringify(currentBooks));
    return cleanData;
  },

  // Delete book
  async deleteBook(bookId) {
    if (this.db) {
      try {
        await this.db.collection('books').doc(bookId).delete();
      } catch (err) {
        console.warn("Firestore deleteBook error:", err);
      }
    }
    const currentBooks = this.getBooksSync(true).filter(b => b.id !== bookId);
    localStorage.setItem('sr_books', JSON.stringify(currentBooks));
    return true;
  },

  // Orders Management
  async getOrders() {
    if (this.db) {
      try {
        const snapshot = await this.db.collection('orders').orderBy('createdAt', 'desc').get();
        if (!snapshot.empty) {
          const orders = [];
          snapshot.forEach(doc => {
            orders.push({ orderId: doc.id, ...doc.data() });
          });
          localStorage.setItem('sr_orders', JSON.stringify(orders));
          return orders;
        }
      } catch (err) {
        console.warn("Firestore getOrders error, using cache:", err);
      }
    }

    const saved = localStorage.getItem('sr_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        orderId: "SR-9932",
        customerName: "Ananya S.",
        customerEmail: "ananya.s@gmail.com",
        bookTitle: "Atomic Habits",
        format: "E-Book",
        amount: 149,
        causeShare: 37.25,
        status: "Completed",
        date: "28 Aug 2026",
        createdAt: new Date().toISOString()
      },
      {
        orderId: "SR-9931",
        customerName: "Murugan K.",
        customerEmail: "murugan.k@yahoo.com",
        bookTitle: "Rich Dad Poor Dad",
        format: "Audiobook",
        amount: 199,
        causeShare: 49.75,
        status: "Completed",
        date: "27 Aug 2026",
        createdAt: new Date().toISOString()
      }
    ];
  },

  // Synchronous getter for orders
  getOrdersSync() {
    const saved = localStorage.getItem('sr_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  },

  // Create order
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
        console.warn("Firestore createOrder error:", err);
      }
    }

    const orders = this.getOrdersSync();
    orders.unshift(fullOrder);
    localStorage.setItem('sr_orders', JSON.stringify(orders));
    return fullOrder;
  },

  // Store Settings (Cloudinary keys, cause percentages)
  async getSettings() {
    const defaultSettings = {
      cloudinaryCloudName: localStorage.getItem('sr_cloudinary_cloud_name') || 'socialreaders',
      cloudinaryUploadPreset: localStorage.getItem('sr_cloudinary_preset') || 'tfy3lcci',
      causePercentage: 25,
      educationSplit: 15,
      sportsSplit: 10,
      supportEmail: 'support@socialreaders.org'
    };

    if (this.db) {
      try {
        const doc = await this.db.collection('settings').doc('store').get();
        if (doc.exists) {
          return { ...defaultSettings, ...doc.data() };
        }
      } catch (err) {
        console.warn("Firestore getSettings error:", err);
      }
    }

    const saved = localStorage.getItem('sr_store_settings');
    if (saved) {
      try { return { ...defaultSettings, ...JSON.parse(saved) }; } catch (e) {}
    }
    return defaultSettings;
  },

  async saveSettings(newSettings) {
    if (this.db) {
      try {
        await this.db.collection('settings').doc('store').set(newSettings, { merge: true });
      } catch (err) {
        console.warn("Firestore saveSettings error:", err);
      }
    }
    localStorage.setItem('sr_store_settings', JSON.stringify(newSettings));
    if (newSettings.cloudinaryCloudName) {
      localStorage.setItem('sr_cloudinary_cloud_name', newSettings.cloudinaryCloudName);
    }
    if (newSettings.cloudinaryUploadPreset) {
      localStorage.setItem('sr_cloudinary_preset', newSettings.cloudinaryUploadPreset);
    }
    return newSettings;
  },

  // One-time Admin Action: Seed Demo Data into Firestore
  async seedDemoData() {
    const books = this.getInitialBooks();
    if (this.db) {
      const batch = this.db.batch();
      books.forEach(b => {
        const ref = this.db.collection('books').doc(b.id);
        batch.set(ref, b, { merge: true });
      });
      await batch.commit();
    }
    localStorage.setItem('sr_books', JSON.stringify(books));
    return { success: true, count: books.length };
  }
};
