/**
 * Generated Firebase Configuration for E-Book Project
 */
const baseFirebaseConfig = {
  "apiKey": "AIzaSyDRz477R0X0lexNOSsHJUmNs3ut5VzaWk",
  "authDomain": "e-book-7c31a.firebaseapp.com",
  "projectId": "e-book-7c31a",
  "storageBucket": "e-book-7c31a.firebasestorage.app",
  "messagingSenderId": "34774269799",
  "appId": "1:34774269799:web:225f344859794de1a139c2",
  "measurementId": "G-Y5HDMGDDPR"
};
const savedLocalApiKey = (typeof localStorage !== 'undefined') ? (localStorage.getItem('ebook_firebase_api_key') || localStorage.getItem('sr_firebase_api_key')) : null;
const firebaseConfig = {
  ...baseFirebaseConfig,
  apiKey: (savedLocalApiKey || baseFirebaseConfig.apiKey || '').trim()
};
window.firebaseConfig = firebaseConfig;

window.FirebaseService = {
  isConfigured() {
    return Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10);
  },
  init() {
    if (typeof firebase !== 'undefined') {
      if (this.isConfigured()) {
        try {
          if (!firebase.apps.length) {
            window.firebaseApp = firebase.initializeApp(firebaseConfig);
          } else {
            window.firebaseApp = firebase.app();
          }
          window.firebaseAuth = firebase.auth();
          window.firebaseDb = firebase.firestore();
          console.log("🔥 Live Firebase initialized for E-Book:", firebaseConfig.projectId);
        } catch (err) {
          console.error("Firebase Init Error:", err);
        }
      } else {
        console.log("⚡ Operating in direct REST fallback mode.");
      }
    }
  }
};

// Immediate synchronous initialization so subsequent scripts have active Firebase app
window.FirebaseService.init();

document.addEventListener('DOMContentLoaded', () => {
  if (!window.firebaseApp && typeof firebase !== 'undefined' && window.FirebaseService.isConfigured()) {
    window.FirebaseService.init();
  }
});
