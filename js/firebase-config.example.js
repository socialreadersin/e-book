/**
 * Social Readers - Firebase Configuration Template (EXAMPLE ONLY)
 * Copy this file to `js/firebase-config.js` and add your real keys.
 * `js/firebase-config.js` is gitignored to protect sensitive credentials.
 */

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Global Firebase instance wrapper with fallback data
window.SocialReadersDB = {
  config: firebaseConfig,
  isLive: false,
  getBooks() { return []; },
  saveBooks(b) {},
  getBookById(id) { return null; },
  getOrders() { return []; },
  createOrder(o) { return o; }
};
