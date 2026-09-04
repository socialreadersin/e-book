/**
 * Social Readers - Production Firebase Authentication & Authorization
 * Identity Source of Truth: Firebase Auth (firebase.auth())
 * Admin Role Source of Truth: Firestore `admins/{uid}` collection
 * 
 * ⚠️ localStorage is NEVER used as the source of truth for auth or roles.
 */

function ensureFirebaseInitialized() {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      if (window.FirebaseService && window.FirebaseService.init) {
        window.FirebaseService.init();
      } else if (window.firebaseConfig && window.firebaseConfig.apiKey) {
        firebase.initializeApp(window.firebaseConfig);
      }
    }
  }
}

window.SocialReadersAuth = {
  _adminStatePromise: null,

  /**
   * Get current Firebase Auth user asynchronously
   */
  async getCurrentFirebaseUser() {
    ensureFirebaseInitialized();
    if (typeof firebase === 'undefined' || !firebase.auth || !firebase.apps.length) {
      return null;
    }
    return new Promise((resolve) => {
      const currentUser = firebase.auth().currentUser;
      if (currentUser) {
        resolve(currentUser);
        return;
      }
      const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user || null);
      });
    });
  },

  /**
   * Synchronous check for current user from active Firebase Auth instance
   */
  getCurrentUser() {
    ensureFirebaseInitialized();
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.apps.length) {
      const fbUser = firebase.auth().currentUser;
      if (fbUser) {
        return {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email.split('@')[0],
          email: fbUser.email,
          role: 'customer',
          isLoggedIn: true
        };
      }
    }
    return null;
  },

  /**
   * Check if current user is an authenticated Admin in Firestore `admins/{uid}`
   */
  async isAdminAsync() {
    ensureFirebaseInitialized();
    if (typeof firebase === 'undefined' || !firebase.auth || !firebase.apps.length) {
      return false;
    }
    const user = await this.getCurrentFirebaseUser();
    if (!user) return false;

    try {
      if (firebase.firestore) {
        const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
        if (adminDoc.exists && adminDoc.data().active !== false) {
          return true;
        }
      }
    } catch (err) {
      console.warn('[SocialReadersAuth] Admin role verification notice:', err.message);
    }
    return false;
  },

  /**
   * Synchronous admin check based on active Firebase Auth session
   */
  isAdminAuthenticated() {
    ensureFirebaseInitialized();
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.apps.length) {
      const user = firebase.auth().currentUser;
      return !!user;
    }
    return false;
  },

  /**
   * Login Admin using Firebase Auth and verify admin privilege in Firestore `admins/{uid}`
   */
  async loginAdmin(email, password) {
    ensureFirebaseInitialized();

    if (!email || !password) {
      return { success: false, message: 'Please provide both admin email and password.' };
    }

    if (typeof firebase === 'undefined' || !firebase.auth || !firebase.apps.length) {
      return { success: false, message: 'Firebase Authentication service is unavailable. Please check configuration.' };
    }

    try {
      const cleanEmail = email.trim();
      const userCredential = await firebase.auth().signInWithEmailAndPassword(cleanEmail, password);
      const user = userCredential.user;

      // Verify admin authorization directly in Firestore `admins/{uid}`
      let isAdmin = false;
      if (firebase.firestore) {
        const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
        if (adminDoc.exists && adminDoc.data().active !== false) {
          isAdmin = true;
        }
      }

      if (!isAdmin) {
        await firebase.auth().signOut();
        return {
          success: false,
          message: 'Access denied. Your account is not registered in the administrator directory.'
        };
      }

      return {
        success: true,
        session: {
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          role: 'admin',
          isLoggedIn: true
        }
      };
    } catch (authErr) {
      console.error('[SocialReadersAuth] Admin Login Error:', authErr);
      let msg = authErr.message || 'Invalid administrator credentials.';
      if (
        authErr.code === 'auth/invalid-credential' ||
        authErr.code === 'auth/wrong-password' ||
        authErr.code === 'auth/user-not-found'
      ) {
        msg = 'Invalid email or password. Please verify your credentials.';
      }
      return { success: false, message: msg };
    }
  },

  /**
   * Logout Admin - Professional Complete Session Termination
   */
  async logoutAdmin() {
    ensureFirebaseInitialized();
    try {
      if (typeof firebase !== 'undefined' && firebase.auth && firebase.apps.length) {
        await firebase.auth().signOut();
      }
    } catch (e) {
      console.warn('[SocialReadersAuth] Sign out notice:', e);
    }

    try {
      localStorage.removeItem('sr_admin_auth');
      localStorage.removeItem('sr_admin_session_start');
      localStorage.removeItem('sr_admin_session_expiry');
      sessionStorage.removeItem('sr_admin_session');
      sessionStorage.clear();
    } catch (_) {}

    // Determine target login page URL based on current path
    const isInsideAdmin = window.location.pathname.includes('/admin/');
    const targetUrl = isInsideAdmin ? 'login.html?logged_out=1' : 'admin/login.html?logged_out=1';
    window.location.replace(targetUrl);
  },

  /**
   * Customer User Login via Firebase Auth
   */
  async loginUser(email, password) {
    ensureFirebaseInitialized();

    if (!email || !password) {
      return { success: false, message: 'Please enter both email and password.' };
    }

    const cleanEmail = email.trim();

    if (typeof firebase === 'undefined' || !firebase.auth || !firebase.apps.length) {
      return { success: false, message: 'Authentication service currently unavailable. Please check your connection.' };
    }

    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(cleanEmail, password);
      const user = userCredential.user;

      // Ensure user profile document exists in Firestore
      if (firebase.firestore) {
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        const doc = await userRef.get();
        if (!doc.exists) {
          await userRef.set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || cleanEmail.split('@')[0],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        } else {
          await userRef.update({
            lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      }

      return {
        success: true,
        user: {
          uid: user.uid,
          name: user.displayName || cleanEmail.split('@')[0],
          email: user.email,
          role: 'customer',
          isLoggedIn: true
        }
      };
    } catch (authErr) {
      console.error('[SocialReadersAuth] User login error:', authErr);
      let msg = authErr.message || 'Invalid email or password.';
      if (
        authErr.code === 'auth/invalid-credential' ||
        authErr.code === 'auth/wrong-password' ||
        authErr.code === 'auth/user-not-found'
      ) {
        msg = 'Invalid email or password. Please try again.';
      }
      return { success: false, message: msg };
    }
  },

  /**
   * Customer User Registration via Firebase Auth & Firestore
   */
  async signupUser(name, email, password) {
    ensureFirebaseInitialized();

    if (!email || !password) {
      return { success: false, message: 'Please provide an email and password.' };
    }

    const cleanEmail = email.trim();
    const cleanName = name ? name.trim() : cleanEmail.split('@')[0];

    if (typeof firebase === 'undefined' || !firebase.auth || !firebase.apps.length) {
      return { success: false, message: 'Registration service currently unavailable. Please check your connection.' };
    }

    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(cleanEmail, password);
      const user = userCredential.user;

      if (user) {
        await user.updateProfile({ displayName: cleanName });

        // Create Firestore user record
        if (firebase.firestore) {
          await firebase.firestore().collection('users').doc(user.uid).set({
            uid: user.uid,
            email: cleanEmail,
            displayName: cleanName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
      }

      return {
        success: true,
        user: {
          uid: user.uid,
          name: cleanName,
          email: cleanEmail,
          role: 'customer',
          isLoggedIn: true
        }
      };
    } catch (e) {
      console.error('[SocialReadersAuth] User signup error:', e);
      return { success: false, message: e.message || 'Registration failed. Please try again.' };
    }
  },

  /**
   * Customer Logout
   */
  async logoutUser() {
    ensureFirebaseInitialized();
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.apps.length) {
      try {
        await firebase.auth().signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    window.location.reload();
  },

  /**
   * Admin route protection guard (Executes async verification)
   */
  async requireAdmin() {
    ensureFirebaseInitialized();
    if (typeof firebase === 'undefined' || !firebase.auth) {
      window.location.href = 'login.html';
      return;
    }

    const user = await this.getCurrentFirebaseUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    const isAdmin = await this.isAdminAsync();
    if (!isAdmin) {
      console.warn('[SocialReadersAuth] Non-admin user attempted to access admin console. Redirecting.');
      window.location.href = 'login.html';
    }
  }
};
