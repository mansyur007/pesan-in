(function () {
  let activeCategory = null;
  let searchTimer = null;

  const list = document.getElementById('restaurantsList');
  const catStrip = document.getElementById('catStrip');
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');
  const sectionTitle = document.getElementById('sectionTitle');
  const resultCount = document.getElementById('resultCount');

  async function loadCategories() {
    const cats = await API.get('/categories');
    catStrip.innerHTML =
      `<button class="cat-chip active" data-slug=""><span class="cat-icon">🍽️</span>Semua</button>` +
      cats.map(c =>
        `<button class="cat-chip" data-slug="${c.slug}"><span class="cat-icon">${c.icon}</span>${c.name}</button>`
      ).join('');
    catStrip.querySelectorAll('.cat-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        catStrip.querySelectorAll('.cat-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.slug || null;
        loadRestaurants();
      });
    });
  }

  async function loadRestaurants() {
    list.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
    const params = [];
    if (activeCategory) params.push(`category=${activeCategory}`);
    const q = searchInput.value.trim();
    if (q) params.push(`search=${encodeURIComponent(q)}`);
    const url = '/restaurants' + (params.length ? '?' + params.join('&') : '');
    const restaurants = await API.get(url);

    sectionTitle.textContent = q
      ? `Hasil "${q}"`
      : activeCategory ? 'Kategori' : 'Restoran Populer';
    resultCount.textContent = restaurants.length ? `${restaurants.length} restoran` : '';

    if (!restaurants.length) {
      list.innerHTML = `<div class="empty-state"><div class="icon">🔍</div><div>Tidak ada restoran ditemukan</div></div>`;
      return;
    }

    list.innerHTML = restaurants.map(r => `
      <a class="restaurant-card" href="/restaurant.html?id=${r.slug || r.id}">
        ${r.image_url
          ? `<img src="${r.image_url}" alt="${r.name}" loading="lazy">`
          : `<div class="img-placeholder">${r.category_icon || '🍽️'}</div>`}
        <div class="card-body">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:4px;">
            <span style="font-size:15px;font-weight:700;color:#1A1A1A;">${r.name}</span>
            ${!r.is_open ? '<span class="badge-closed">Tutup</span>' : ''}
          </div>
          <div style="font-size:12px;color:#777;margin-bottom:8px;">${r.description || ''}</div>
          <div style="display:flex;align-items:center;gap:10px;font-size:12px;color:#555;flex-wrap:wrap;">
            <span>${starRating(r.rating)}</span>
            <span>·</span>
            <span>⏱ ${r.delivery_time_min}-${r.delivery_time_max} mnt</span>
            <span>·</span>
            <span>🛵 ${formatRupiah(r.delivery_fee)}</span>
          </div>
        </div>
      </a>
    `).join('');
  }

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

  searchInput.addEventListener('input', () => {
    clearBtn.style.display = searchInput.value ? '' : 'none';
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadRestaurants, 400);
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    loadRestaurants();
  });

  loadCategories();
  loadRestaurants();
  renderCartBar();
  window.addEventListener('focus', renderCartBar);
})();
