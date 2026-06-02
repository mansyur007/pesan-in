(function () {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) { location.href = '/'; return; }

  let restaurant = null;
  let menuItems = [];

  async function init() {
    try {
      restaurant = await API.get(`/restaurants/${id}`);
      document.title = restaurant.name + ' - Pesanin';
      const menuCategories = await API.get(`/restaurants/${id}/menu`);
      menuItems = menuCategories.flatMap(c => c.items);
      render(restaurant, menuCategories);
    } catch (e) {
      document.getElementById('restaurantContent').innerHTML =
        `<div class="empty-state" style="padding-top:80px"><div class="icon">😕</div><div>Restoran tidak ditemukan</div><br><a href="/" style="color:var(--green)">Kembali ke Beranda</a></div>`;
    }
  }

  function render(r, menuCategories) {
    const content = document.getElementById('restaurantContent');
    const imgHtml = r.image_url
      ? `<img src="${r.image_url}" alt="${r.name}">`
      : `<div class="img-placeholder">${r.category_icon || '🍽️'}</div>`;

    content.innerHTML = `
      <div class="rest-header">
        ${imgHtml}
        <button class="back-btn" onclick="history.back()">←</button>
      </div>
      <div class="rest-info">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <h1 style="margin:0;font-size:18px;font-weight:800;flex:1;">${r.name}</h1>
          ${!r.is_open ? '<span class="badge-closed">Tutup</span>' : ''}
        </div>
        <div style="font-size:13px;color:#777;margin-bottom:8px;">${r.description || ''}</div>
        <div style="display:flex;gap:12px;font-size:12px;color:#555;flex-wrap:wrap;">
          <span>${starRating(r.rating)} (${r.review_count})</span>
          <span>⏱ ${r.delivery_time_min}-${r.delivery_time_max} mnt</span>
          <span>🛵 ${formatRupiah(r.delivery_fee)}</span>
          <span>📍 ${r.address || ''}</span>
        </div>
      </div>
      <div class="menu-tabs" id="menuTabs"></div>
      <div class="menu-section" id="menuSections"></div>
    `;

    const tabs = document.getElementById('menuTabs');
    const sections = document.getElementById('menuSections');

    menuCategories.forEach((cat, i) => {
      const tab = document.createElement('button');
      tab.className = 'menu-tab' + (i === 0 ? ' active' : '');
      tab.textContent = cat.name;
      tab.addEventListener('click', () => {
        tabs.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('sec-' + cat.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      tabs.appendChild(tab);

      const sec = document.createElement('div');
      sec.id = 'sec-' + cat.id;
      sec.innerHTML = `<div class="menu-section-header">${cat.name}</div>` +
        cat.items.map(item => menuItemHTML(item)).join('');
      sections.appendChild(sec);
    });

    renderCartBar();
  }

  function menuItemHTML(item) {
    const qty = Cart.getQuantity(item.id);
    const unavailable = !item.is_available;
    const controls = qty > 0
      ? `<button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
         <span class="qty-num">${qty}</span>
         <button class="qty-btn add" onclick="changeQty(${item.id},1)">+</button>`
      : `<button class="qty-btn add" onclick="changeQty(${item.id},1)"${unavailable ? ' disabled style="opacity:0.4"' : ''}>+</button>`;
    return `
      <div class="menu-item" id="mi-${item.id}"${unavailable ? ' style="opacity:0.55"' : ''}>
        <div class="menu-item-info">
          ${item.is_popular ? '<span class="badge-popular" style="font-size:10px;margin-bottom:4px;display:inline-block;">Populer</span>' : ''}
          <h4>${item.name}${unavailable ? ' <span style="font-size:11px;color:#999;font-weight:400">(Habis)</span>' : ''}</h4>
          ${item.description ? `<p>${item.description}</p>` : ''}
          <div class="price">${formatRupiah(item.price)}</div>
        </div>
        <div class="qty-control">${controls}</div>
      </div>`;
  }

  window.changeQty = function (itemId, delta) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item || !restaurant) return;
    if (delta > 0) {
      if (!Cart.addItem(restaurant.id, restaurant.name, item)) return;
      showToast(`${item.name} ditambahkan`);
    } else {
      Cart.removeItem(restaurant.id, itemId);
      showToast(`${item.name} dikurangi`);
    }
    const el = document.getElementById('mi-' + itemId);
    if (el) el.outerHTML = menuItemHTML(item);
    renderCartBar();
  };

  function renderCartBar() {
    let bar = document.getElementById('cartBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'cartBar';
      bar.className = 'cart-bar hidden';
      bar.style.bottom = '60px';
      bar.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="cart-badge" id="cartCount">0</div>
          <span style="font-size:14px;font-weight:600;">Lihat Keranjang</span>
        </div>
        <span id="cartTotal" style="font-weight:700;"></span>
      `;
      bar.addEventListener('click', () => location.href = '/cart.html');
      document.body.appendChild(bar);
    }
    const count = Cart.count();
    if (count > 0) {
      bar.classList.remove('hidden');
      document.getElementById('cartCount').textContent = count;
      document.getElementById('cartTotal').textContent = formatRupiah(Cart.total());
    } else {
      bar.classList.add('hidden');
    }
  }

  init();
})();
