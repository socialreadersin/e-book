/**
 * Firebase Initializer and Service Hub (js/firebase.js)
 * 
 * References configuration exclusively from `firebase-config.js` (never inline credentials).
 */

(function() {
  // 1. Resolve configuration from firebase-config.js
  function getResolvedConfig() {
    if (typeof window !== 'undefined' && window.firebaseConfig) {
      return window.firebaseConfig;
    }
    if (typeof window !== 'undefined' && window.FirebaseConfigHelper) {
      return window.FirebaseConfigHelper.getConfig();
    }
    console.warn("⚠️ Firebase config not found on window. Ensure js/firebase-config.js is loaded prior to js/firebase.js");
    return null;
  }

  const config = getResolvedConfig();

  // 2. Initialize Firebase SDK instances if SDK scripts are present
  let app = null;
  let auth = null;
  let db = null;

  if (typeof firebase !== 'undefined' && config && config.apiKey && !config.apiKey.includes('YOUR_')) {
    try {
      if (!firebase.apps || !firebase.apps.length) {
        app = firebase.initializeApp(config);
      } else {
        app = firebase.app();
      }

      if (typeof firebase.auth === 'function') {
        auth = firebase.auth();
      }

      if (typeof firebase.firestore === 'function') {
        db = firebase.firestore();
      }

      console.log("🔥 Firebase initialized in js/firebase.js for project:", config.projectId);
    } catch (err) {
      console.error("Firebase initialization failed in js/firebase.js:", err);
    }
  }

  // 3. Expose service bindings to window
  if (typeof window !== 'undefined') {
    window.firebaseApp = app || window.firebaseApp || null;
    window.firebaseAuth = auth || window.firebaseAuth || null;
    window.firebaseDb = db || window.firebaseDb || null;

    window.FirebaseHub = {
      getConfig: getResolvedConfig,
      getApp: () => window.firebaseApp,
      getAuth: () => window.firebaseAuth,
      getDb: () => window.firebaseDb,
      isLive: () => Boolean(window.firebaseApp && window.firebaseDb)
    };
  }
})();
