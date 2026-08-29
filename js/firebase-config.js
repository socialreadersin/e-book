/**
 * Social Readers - Firebase Configuration & Initialization
 * Supports Firebase Auth & Cloud Firestore
 * Gracefully falls back to local simulation mode if keys are not yet configured in admin
 */

const firebaseConfig = {
  apiKey: localStorage.getItem('sr_firebase_api_key') || "AIzaSyDummyKeySocialReaders2026",
  authDomain: localStorage.getItem('sr_firebase_auth_domain') || "social-readers-store.firebaseapp.com",
  projectId: localStorage.getItem('sr_firebase_project_id') || "social-readers-store",
  storageBucket: localStorage.getItem('sr_firebase_storage_bucket') || "social-readers-store.appspot.com",
  messagingSenderId: "109827364521",
  appId: "1:109827364521:web:abcdef987654321"
};

// Global Firebase instance wrapper
window.SocialReadersDB = {
  config: firebaseConfig,
  isLive: false,
  
  // Default Books & Audiobooks seed data
  getInitialBooks() {
    return [
      {
        id: "b1",
        title: { en: "Atomic Habits", ta: "அட்டாமிக் ஹாபிட்ஸ்" },
        author: { en: "James Clear", ta: "ஜேம்ஸ் க்ளியர்" },
        price: 149,
        category: "selfdev",
        type: "both", // ebook, audiobook, both
        isBestseller: true,
        coverUrl: "assets/cover-atomic-habits.svg",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        audioDuration: "5 hrs 35 mins",
        narrator: "James Clear",
        rating: 4.9,
        reviewsCount: 428,
        description: {
          en: "An easy & proven way to build good habits & break bad ones. Transform your daily routine one percent at a time.",
          ta: "நல்ல பழக்கங்களை உருவாக்கவும் கெட்ட பழக்கங்களை அழிக்கவும் நிரூபிக்கப்பட்ட எளிய வழிமுறை."
        }
      },
      {
        id: "b2",
        title: { en: "The Power of Mindset", ta: "மைண்ட்செட் ஆற்றல்" },
        author: { en: "Carol S. Dweck", ta: "கரோல் எஸ். டுவெக்" },
        price: 179,
        category: "health",
        type: "both",
        isBestseller: false,
        coverUrl: "assets/cover-mindset.svg",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        audioDuration: "6 hrs 12 mins",
        narrator: "Carol S. Dweck",
        rating: 4.8,
        reviewsCount: 312,
        description: {
          en: "Discover how our beliefs about our capabilities shape our success and how fostering a growth mindset changes everything.",
          ta: "நமது எண்ணங்கள் வெற்றியை எவ்வாறு தீர்மானிக்கின்றன என்பதை விளக்கும் அற்புதமான வழிகாட்டி."
        }
      },
      {
        id: "b3",
        title: { en: "You Can Win", ta: "யு கேன் வின்" },
        author: { en: "Shiv Khera", ta: "ஷிவ் கேரா" },
        price: 149,
        category: "selfdev",
        type: "ebook",
        isBestseller: true,
        coverUrl: "assets/cover-you-can-win.svg",
        rating: 4.9,
        reviewsCount: 520,
        description: {
          en: "A step-by-step tool for top achievers. Winners don't do different things, they do things differently.",
          ta: "வெற்றியாளர்கள் வித்தியாசமான செயல்களைச் செய்வதில்லை, அவர்கள் செயல்களை வித்தியாசமாகச் செய்கிறார்கள்."
        }
      },
      {
        id: "b4",
        title: { en: "Rich Dad Poor Dad", ta: "ரிச் டாட் புவர் டாட்" },
        author: { en: "Robert Kiyosaki", ta: "ராபர்ட் கியோசாகி" },
        price: 199,
        category: "business",
        type: "both",
        isBestseller: true,
        coverUrl: "assets/cover-rich-dad.svg",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        audioDuration: "6 hrs 45 mins",
        narrator: "Robert Kiyosaki",
        rating: 4.9,
        reviewsCount: 890,
        description: {
          en: "What the rich teach their kids about money that the poor and middle class do not! Master financial independence.",
          ta: "பணம் குறித்து பணக்காரர்கள் தங்கள் குழந்தைகளுக்கு கற்றுக்கொடுக்கும் நிதி மேலாண்மை ரகசியங்கள்."
        }
      },
      {
        id: "b5",
        title: { en: "Wings of Fire", ta: "அக்னி சிறகுகள்" },
        author: { en: "Dr. A.P.J. Abdul Kalam", ta: "டாக்டர் ஏ.பி.ஜே. அப்துல் கலாம்" },
        price: 159,
        category: "biography",
        type: "both",
        isBestseller: true,
        coverUrl: "assets/cover-wings-of-fire.svg",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        audioDuration: "7 hrs 20 mins",
        narrator: "Girish Karnad",
        rating: 5.0,
        reviewsCount: 1240,
        description: {
          en: "An inspiring autobiography of an ordinary boy from Rameswaram who went on to become the Missile Man of India.",
          ta: "ராமேஸ்வரத்தில் பிறந்து இந்தியாவின் ஏவுகணை மனிதராக உயர்ந்த ஒரு மாமனிதரின் உத்வேக சுயசரிதை."
        }
      },
      {
        id: "b6",
        title: { en: "Ikigai: The Japanese Secret", ta: "இக்கிகாய்" },
        author: { en: "Héctor García & F. Miralles", ta: "ஹெக்டர் கார்சியா" },
        price: 169,
        category: "health",
        type: "audiobook",
        isBestseller: false,
        coverUrl: "assets/cover-ikigai.svg",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        audioDuration: "3 hrs 50 mins",
        narrator: "Naoko Mori",
        rating: 4.7,
        reviewsCount: 260,
        description: {
          en: "The Japanese secret to a long, happy and purposeful life. Discover your reason for getting up every morning.",
          ta: "நீண்ட மற்றும் மகிழ்ச்சியான வாழ்விற்கான ஜப்பானிய ரகசியம். வாழ்வின் நோக்கத்தைக் கண்டறியுங்கள்."
        }
      },
      {
        id: "b7",
        title: { en: "Deep Work", ta: "டீப் ஒர்க்" },
        author: { en: "Cal Newport", ta: "கால் நியூபோர்ட்" },
        price: 189,
        category: "selfdev",
        type: "ebook",
        isBestseller: false,
        coverUrl: "assets/cover-deep-work.svg",
        rating: 4.8,
        reviewsCount: 380,
        description: {
          en: "Rules for focused success in a distracted world. Master hard things and produce elite quality output quickly.",
          ta: "கவனச்சிதறல்கள் நிறைந்த உலகில் தீவிர கவனத்துடன் சிறப்பான சாதனைகளை படைப்பதற்கான விதிகள்."
        }
      },
      {
        id: "b8",
        title: { en: "The Psychology of Money", ta: "தி சைக்காலஜி ஆஃப் மணி" },
        author: { en: "Morgan Housel", ta: "மோர்கன் ஹவுசல்" },
        price: 199,
        category: "business",
        type: "both",
        isBestseller: true,
        coverUrl: "assets/cover-psychology-money.svg",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        audioDuration: "5 hrs 40 mins",
        narrator: "Chris Hill",
        rating: 4.9,
        reviewsCount: 650,
        description: {
          en: "Timeless lessons on wealth, greed, and happiness doing well with money isn't necessarily about what you know.",
          ta: "செல்வம், பேராசை மற்றும் மகிழ்ச்சி பற்றிய காலத்தால் அழியாத நிதிக் கொள்கைகள்."
        }
      }
    ];
  },

  // Get all books with localStorage sync
  getBooks() {
    const saved = localStorage.getItem('sr_books');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch(e) {
        console.error(e);
      }
    }
    const initial = this.getInitialBooks();
    localStorage.setItem('sr_books', JSON.stringify(initial));
    return initial;
  },

  saveBooks(books) {
    localStorage.setItem('sr_books', JSON.stringify(books));
  },

  getBookById(id) {
    const books = this.getBooks();
    return books.find(b => b.id === id) || books[0];
  },

  // Orders Management
  getOrders() {
    const saved = localStorage.getItem('sr_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch(e) {
        console.error(e);
      }
    }
    const defaultOrders = [
      {
        orderId: "SR-9932",
        customerName: "Ananya S.",
        customerEmail: "ananya.s@gmail.com",
        bookTitle: "Atomic Habits",
        format: "E-Book",
        amount: 149,
        causeShare: 37.25,
        status: "Completed",
        date: "28 Aug 2026"
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
        date: "27 Aug 2026"
      },
      {
        orderId: "SR-9930",
        customerName: "Priya V.",
        customerEmail: "priya.v@gmail.com",
        bookTitle: "Wings of Fire",
        format: "E-Book + Audio",
        amount: 159,
        causeShare: 39.75,
        status: "Completed",
        date: "26 Aug 2026"
      },
      {
        orderId: "SR-9929",
        customerName: "Dinesh Kumar",
        customerEmail: "dinesh.k@outlook.com",
        bookTitle: "The Power of Mindset",
        format: "E-Book",
        amount: 179,
        causeShare: 44.75,
        status: "Completed",
        date: "25 Aug 2026"
      }
    ];
    localStorage.setItem('sr_orders', JSON.stringify(defaultOrders));
    return defaultOrders;
  },

  createOrder(orderData) {
    const orders = this.getOrders();
    orders.unshift(orderData);
    localStorage.setItem('sr_orders', JSON.stringify(orders));
    return orderData;
  }
};
