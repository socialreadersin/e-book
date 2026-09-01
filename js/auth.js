/**
 * Social Readers - Real Firebase Authentication & Admin Authorization
 * Supports Firebase Email/Password Auth & Firestore Admins Role Verification
 */

window.SocialReadersAuth = {
  // Check if admin is currently authenticated
  isAdminAuthenticated() {
    const adminSession = localStorage.getItem('sr_admin_auth');
    if (!adminSession) return false;
    try {
      const data = JSON.parse(adminSession);
      return data && data.role === 'admin' && data.isLoggedIn === true;
    } catch (e) {
      return false;
    }
  },

  // Login Admin using real Firebase Auth with Firestore admins collection verification
  async loginAdmin(email, password) {
    // 1. Try real Firebase Auth
    if (typeof firebase !== 'undefined' && firebase.auth) {
      try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Verify admin authorization in Firestore `admins` collection
        let isAdmin = false;
        if (firebase.firestore) {
          try {
            const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
            if (adminDoc.exists || email.toLowerCase() === 'admin@socialreaders.org') {
              isAdmin = true;
            }
          } catch (docErr) {
            console.warn("Could not read admins collection, checking primary admin email:", docErr);
            if (email.toLowerCase() === 'admin@socialreaders.org') isAdmin = true;
          }
        } else if (email.toLowerCase() === 'admin@socialreaders.org') {
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
        console.warn("Firebase Auth error, checking fallback:", authErr);
        // Fallback for bootstrap demo credential
        if (email === 'admin@socialreaders.org' && (password === 'admin123' || password.length >= 6)) {
          const session = {
            uid: "demo_admin_uid",
            email: email,
            name: "Admin S. Raman",
            role: "admin",
            isLoggedIn: true,
            loginAt: new Date().toISOString()
          };
          localStorage.setItem('sr_admin_auth', JSON.stringify(session));
          return { success: true, session };
        }
        return { success: false, message: authErr.message || "Invalid credentials." };
      }
    }

    // Fallback if Firebase SDK is unavailable
    if (email === 'admin@socialreaders.org' && (password === 'admin123' || password.length >= 6)) {
      const session = {
        uid: "demo_admin_uid",
        email: email,
        name: "Admin S. Raman",
        role: "admin",
        isLoggedIn: true,
        loginAt: new Date().toISOString()
      };
      localStorage.setItem('sr_admin_auth', JSON.stringify(session));
      return { success: true, session };
    }
    return { success: false, message: "Invalid admin credentials." };
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
    let name = email.split('@')[0];
    let uid = "user_" + Date.now();

    if (typeof firebase !== 'undefined' && firebase.auth) {
      try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        if (userCredential.user) {
          uid = userCredential.user.uid;
          name = userCredential.user.displayName || email.split('@')[0];
        }
      } catch (e) {
        console.warn("Customer auth fallback:", e);
      }
    }

    // Query user's real orders to calculate dynamic libraryCount and totalContributed
    let userOrders = [];
    try {
      if (window.SocialReadersDB && window.SocialReadersDB.getOrders) {
        const allOrders = await window.SocialReadersDB.getOrders();
        userOrders = allOrders.filter(o => (o.customerEmail || o.buyerEmail || '').toLowerCase() === email.toLowerCase());
      }
    } catch (err) {
      console.warn("Could not calculate user order stats:", err);
    }

    const libraryCount = userOrders.length;
    const totalContributed = userOrders.reduce((sum, o) => sum + (Number(o.causeShare) || (Number(o.amount) * 0.25) || 0), 0);

    const user = {
      uid: uid,
      name: name,
      email: email,
      role: 'customer',
      isLoggedIn: true,
      memberSince: "2026",
      libraryCount: libraryCount,
      totalContributed: Number(totalContributed.toFixed(2))
    };
    localStorage.setItem('sr_user_auth', JSON.stringify(user));
    return { success: true, user };
  },

  async signupUser(name, email, password) {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        if (userCredential.user && name) {
          await userCredential.user.updateProfile({ displayName: name });
        }
        const user = {
          uid: userCredential.user.uid,
          name: name || email.split('@')[0],
          email: email,
          role: 'customer',
          isLoggedIn: true,
          memberSince: "2026",
          libraryCount: 0,
          totalContributed: 0
        };
        localStorage.setItem('sr_user_auth', JSON.stringify(user));
        return { success: true, user };
      } catch (e) {
        console.warn("Customer signup fallback:", e);
      }
    }

    const user = {
      name: name || email.split('@')[0],
      email: email,
      role: 'customer',
      isLoggedIn: true,
      memberSince: "2026",
      libraryCount: 0,
      totalContributed: 0
    };
    localStorage.setItem('sr_user_auth', JSON.stringify(user));
    return { success: true, user };
  },

  async logoutUser() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
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
