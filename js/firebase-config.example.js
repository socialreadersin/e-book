/**
 * Social Readers - Firebase Configuration Template (EXAMPLE ONLY)
 * 
 * Copy this file to `js/firebase-config.js` and add your real keys, or run `npm run build`.
 * `js/firebase-config.js` is strictly gitignored to protect sensitive credentials.
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

// Global config assignment
if (typeof window !== 'undefined') {
  window.firebaseConfig = firebaseConfig;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = firebaseConfig;
}
