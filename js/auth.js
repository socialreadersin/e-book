/**
 * Social Readers - Real Firebase Authentication & Admin Authorization
 * Supports Firebase Email/Password Auth & Firestore Admins Role Verification
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
  // Check if admin is currently authenticated
  // Check if admin is currently authenticated
  isAdminAuthenticated() {
    const adminSession = localStorage.getItem('sr_admin_auth');
    if (!adminSession) return false;
    try {
      const data = JSON.parse(adminSession);
      if (!data || data.role !== 'admin' || data.isLoggedIn !== true) return false;
      
      // If Firebase Auth is initialized and active, ensure currentUser exists
      if (typeof firebase !== 'undefined' && firebase.auth && firebase.apps && firebase.apps.length) {
        const currentUser = firebase.auth().currentUser;
        if (currentUser && currentUser.uid !== data.uid && data.uid !== 'demo_admin_uid') {
          return false;
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  // Login Admin using real Firebase Auth with Firestore admins collection verification
  async loginAdmin(email, password) {
    ensureFirebaseInitialized();

    if (!email || !password) {
      return { success: false, message: "Please provide both email and password." };
    }

    // 1. Authenticate against Firebase Auth
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.apps.length) {
      try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email.trim(), password);
        const user = userCredential.user;

        // Verify admin authorization in Firestore `admins` collection or primary admin role
        let isAdmin = false;
        if (firebase.firestore) {
          try {
            const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
            if (adminDoc.exists || email.toLowerCase().trim() === 'admin@socialreaders.org') {
              isAdmin = true;
            }
          } catch (docErr) {
            console.warn("Admins collection lookup notice:", docErr);
            if (email.toLowerCase().trim() === 'admin@socialreaders.org') isAdmin = true;
          }
        } else if (email.toLowerCase().trim() === 'admin@socialreaders.org') {
          isAdmin = true;
        }

        if (!isAdmin) {
          await firebase.auth().signOut();
          return { success: false, message: "Access denied. Your account is not authorized as an administrator." };
        }

        const session = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || email.split('@')[0],
          role: "admin",
          isLoggedIn: true,
          loginAt: new Date().toISOString()
        };
        localStorage.setItem('sr_admin_auth', JSON.stringify(session));
        return { success: true, session };
      } catch (authErr) {
        console.error("Firebase Admin Auth error:", authErr);
        let msg = authErr.message || "Invalid administrator credentials.";
        if (authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/wrong-password' || authErr.code === 'auth/user-not-found') {
          msg = "Invalid email or password. Please verify your credentials.";
        }
        return { success: false, message: msg };
      }
    }

    return { success: false, message: "Firebase Authentication service is unavailable. Please check your network or configuration." };
  },

  // Logout Admin
  async logoutAdmin() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      try {
        await firebase.auth().signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    localStorage.removeItem('sr_admin_auth');
    window.location.href = 'login.html';
  },

  // Customer User Auth
  getCurrentUser() {
    const userSession = localStorage.getItem('sr_user_auth');
    if (!userSession) return null;
    try {
      return JSON.parse(userSession);
    } catch (e) {
      return null;
    }
  },

  async loginUser(email, password) {
    ensureFirebaseInitialized();

    if (!email || !password) {
      return { success: false, message: "Please enter both email and password." };
    }

    const cleanEmail = email.trim();

    if (typeof firebase !== 'undefined' && firebase.auth && firebase.apps.length) {
      try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(cleanEmail, password);
        const user = userCredential.user;
        const uid = user.uid;
        const name = user.displayName || cleanEmail.split('@')[0];

        // Query user's real orders using scoped query (never download all platform orders)
        let userOrders = [];
        try {
          if (window.SocialReadersDB && window.SocialReadersDB.getUserOrders) {
            userOrders = await window.SocialReadersDB.getUserOrders(cleanEmail);
          }
        } catch (err) {
          console.warn("Could not calculate user order stats:", err);
        }

        const libraryCount = userOrders.length;
        const totalContributed = userOrders.reduce((sum, o) => sum + (Number(o.causeShare) || (Number(o.amount) * 0.25) || 0), 0);

        const customerSession = {
          uid: uid,
          name: name,
          email: cleanEmail,
          role: 'customer',
          isLoggedIn: true,
          memberSince: "2026",
          libraryCount: libraryCount,
          totalContributed: Number(totalContributed.toFixed(2))
        };
        localStorage.setItem('sr_user_auth', JSON.stringify(customerSession));
        return { success: true, user: customerSession };
      } catch (authErr) {
        console.error("Customer login error:", authErr);
        let msg = authErr.message || "Invalid email or password.";
        if (authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/wrong-password' || authErr.code === 'auth/user-not-found') {
          msg = "Invalid email or password. Please try again.";
        }
        return { success: false, message: msg };
      }
    }

    return { success: false, message: "Authentication service currently unavailable. Please check your connection." };
  },

  async signupUser(name, email, password) {
    ensureFirebaseInitialized();

    if (!email || !password) {
      return { success: false, message: "Please provide an email and password." };
    }

    const cleanEmail = email.trim();

    if (typeof firebase !== 'undefined' && firebase.auth && firebase.apps.length) {
      try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(cleanEmail, password);
        if (userCredential.user && name) {
          await userCredential.user.updateProfile({ displayName: name.trim() });
        }
        const customerSession = {
          uid: userCredential.user.uid,
          name: name ? name.trim() : cleanEmail.split('@')[0],
          email: cleanEmail,
          role: 'customer',
          isLoggedIn: true,
          memberSince: "2026",
          libraryCount: 0,
          totalContributed: 0
        };
        localStorage.setItem('sr_user_auth', JSON.stringify(customerSession));
        return { success: true, user: customerSession };
      } catch (e) {
        console.error("Customer signup error:", e);
        return { success: false, message: e.message || "Registration failed. Please try again." };
      }
    }

    return { success: false, message: "Registration service currently unavailable. Please check your connection." };
  },

  async logoutUser() {
    ensureFirebaseInitialized();
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.apps.length) {
      try {
        await firebase.auth().signOut();
      } catch (e) {}
    }
    localStorage.removeItem('sr_user_auth');
    window.location.reload();
  },

  // Guard admin pages (default to deny access)
  requireAdmin() {
    if (!this.isAdminAuthenticated()) {
      window.location.href = 'login.html';
    }
  }
};
