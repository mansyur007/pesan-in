(function () {
  const ITEMS = [
    { href: '/',                        icon: '🏠', label: 'Beranda',  match: ['/'] },
    { href: '/driver-marketplace.html', icon: '🚗', label: 'Driver',   match: ['/driver-marketplace.html'] },
    { href: '/wallet.html',             icon: '💳', label: 'Dompet',   match: ['/wallet.html'],             auth: true },
    { href: '/order-history.html',      icon: '📋', label: 'Pesanan',  match: ['/order-history.html'],      auth: true },
    { href: '/profile.html',            icon: '👤', label: 'Profil',   match: ['/profile.html', '/auth.html'] },
  ];

  function getUser() {
    try { return JSON.parse(localStorage.getItem('gf_user')); } catch { return null; }
  }

  function build() {
    if (document.getElementById('appNav')) return;

    const path = location.pathname;
    const loggedIn = !!localStorage.getItem('gf_token');
    const user = getUser();

    const nav = document.createElement('nav');
    nav.id = 'appNav';
    nav.innerHTML = ITEMS.map(item => {
      const active = item.match.includes(path);
      const href = item.auth && !loggedIn
        ? '/auth.html?redirect=' + encodeURIComponent(item.href)
        : item.href;
      const icon = item.label === 'Profil' && user ? (user.avatar || '👤') : item.icon;
      return `<a href="${href}" class="nav-item${active ? ' nav-active' : ''}">
        <span class="nav-icon">${icon}</span>
        <span>${item.label}</span>
      </a>`;
    }).join('');

    document.body.appendChild(nav);

    // Push any existing .cart-bar up above the nav
    function liftCartBars() {
      document.querySelectorAll('.cart-bar').forEach(bar => {
        bar.style.bottom = '60px';
      });
    }
    liftCartBars();
    new MutationObserver(liftCartBars).observe(document.body, { childList: true, subtree: false });
  }

  // Inject styles once
  if (!document.getElementById('navStyle')) {
    const s = document.createElement('style');
    s.id = 'navStyle';
    s.textContent = `
      #appNav {
        position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
        width: 100%; max-width: 480px; background: white;
        border-top: 1px solid #eee; display: flex; z-index: 150;
        box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
        padding-bottom: env(safe-area-inset-bottom, 0);
      }
      .nav-item {
        flex: 1; display: flex; flex-direction: column; align-items: center;
        padding: 8px 4px 10px; text-decoration: none;
        color: #bbb; font-size: 10px; font-weight: 500; gap: 2px;
      }
      .nav-item.nav-active { color: #00AA5B; font-weight: 700; }
      .nav-icon { font-size: 22px; line-height: 1.2; }
      body { padding-bottom: max(70px, calc(70px + env(safe-area-inset-bottom, 0px))); }
    `;
    document.head.appendChild(s);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', build)
    : build();
})();
