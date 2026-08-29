/**
 * Social Readers - Authentication & Session Management
 * Supports Customer Auth & Admin Role Verification
 */

window.SocialReadersAuth = {
  // Check if admin is authenticated
  isAdminAuthenticated() {
    const adminSession = localStorage.getItem('sr_admin_auth');
    if (!adminSession) return false;
    try {
      const data = JSON.parse(adminSession);
      return data && data.role === 'admin' && data.isLoggedIn === true;
    } catch(e) {
      return false;
    }
  },

  // Login Admin
  loginAdmin(email, password) {
    if (email === 'admin@socialreaders.org' && (password === 'admin123' || password.length >= 6)) {
      const session = {
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
  logoutAdmin() {
    localStorage.removeItem('sr_admin_auth');
    window.location.href = 'login.html';
  },

  // Customer User Auth
  getCurrentUser() {
    const userSession = localStorage.getItem('sr_user_auth');
    if (!userSession) return null;
    try {
      return JSON.parse(userSession);
    } catch(e) {
      return null;
    }
  },

  loginUser(email, password) {
    const user = {
      name: email.split('@')[0],
      email: email,
      role: 'customer',
      isLoggedIn: true,
      memberSince: "2026",
      libraryCount: 4,
      totalContributed: 172.50
    };
    localStorage.setItem('sr_user_auth', JSON.stringify(user));
    return { success: true, user };
  },

  signupUser(name, email, password) {
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

  logoutUser() {
    localStorage.removeItem('sr_user_auth');
    window.location.reload();
  },

  // Guard admin pages (default to deny)
  requireAdmin() {
    if (!this.isAdminAuthenticated()) {
      window.location.href = 'login.html';
    }
  }
};
