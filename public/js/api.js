const API = {
  base: '/api',

  _h(extra = {}) {
    const h = { 'Content-Type': 'application/json', ...extra };
    const token = localStorage.getItem('gf_token');
    if (token) h['Authorization'] = 'Bearer ' + token;
    return h;
  },

  async get(path) {
    const r = await fetch(this.base + path, { headers: this._h() });
    if (!r.ok) throw await r.json();
    return r.json();
  },

  async post(path, body) {
    const r = await fetch(this.base + path, { method: 'POST', headers: this._h(), body: JSON.stringify(body) });
    const data = await r.json();
    if (!r.ok) throw data;
    return data;
  },

  async put(path, body = {}) {
    const r = await fetch(this.base + path, { method: 'PUT', headers: this._h(), body: JSON.stringify(body) });
    const data = await r.json();
    if (!r.ok) throw data;
    return data;
  },

  async delete(path) {
    const r = await fetch(this.base + path, { method: 'DELETE', headers: this._h() });
    if (!r.ok) throw await r.json();
    return r.json();
  },
};

// Cart - persisted in localStorage
const Cart = {
  KEY: 'gf_cart',

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || { restaurantId: null, restaurantName: '', items: [] }; }
    catch { return { restaurantId: null, restaurantName: '', items: [] }; }
  },

  save(cart) { localStorage.setItem(this.KEY, JSON.stringify(cart)); },

  clear() { localStorage.removeItem(this.KEY); },

  addItem(restaurantId, restaurantName, item) {
    let cart = this.get();
    if (cart.restaurantId && cart.restaurantId !== restaurantId) {
      if (!confirm(`Mengganti pesanan dari ${cart.restaurantName}?\nKeranjang sebelumnya akan dikosongkan.`)) return false;
      cart = { restaurantId: null, restaurantName: '', items: [] };
    }
    cart.restaurantId = restaurantId;
    cart.restaurantName = restaurantName;
    const idx = cart.items.findIndex(i => i.id === item.id);
    if (idx >= 0) cart.items[idx].quantity++;
    else cart.items.push({ ...item, quantity: 1 });
    this.save(cart);
    return true;
  },

  removeItem(restaurantId, itemId) {
    const cart = this.get();
    const idx = cart.items.findIndex(i => i.id === itemId);
    if (idx < 0) return;
    cart.items[idx].quantity--;
    if (cart.items[idx].quantity <= 0) cart.items.splice(idx, 1);
    if (cart.items.length === 0) { cart.restaurantId = null; cart.restaurantName = ''; }
    this.save(cart);
  },

  getQuantity(itemId) {
    const cart = this.get();
    const item = cart.items.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  },

  total() {
    return this.get().items.reduce((s, i) => s + i.price * i.quantity, 0);
  },

  count() {
    return this.get().items.reduce((s, i) => s + i.quantity, 0);
  },
};

function formatRupiah(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function showToast(msg, duration = 2000) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

function starRating(r) {
  return `<span class="star">★</span> <span style="font-weight:600">${r}</span>`;
}
