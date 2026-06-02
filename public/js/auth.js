const Auth = {
  TOKEN_KEY: 'gf_token',
  USER_KEY: 'gf_user',

  getToken() { return localStorage.getItem(this.TOKEN_KEY); },

  getUser() {
    try { return JSON.parse(localStorage.getItem(this.USER_KEY)); }
    catch { return null; }
  },

  isLoggedIn() { return !!this.getToken(); },

  save(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    location.href = '/auth.html';
  },

  requireLogin(redirectBack = true) {
    if (!this.isLoggedIn()) {
      const redirect = redirectBack ? encodeURIComponent(location.pathname + location.search) : '';
      location.href = '/auth.html' + (redirect ? '?redirect=' + redirect : '');
      return false;
    }
    return true;
  },

  isDriver() { return this.getUser()?.role === 'driver'; },
  isAdmin() { return this.getUser()?.role === 'admin'; },
};
