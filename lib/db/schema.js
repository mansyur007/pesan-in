// Skema + seed data lokal Pesan.in (SQLite / better-sqlite3).
// Sumber data: pesanin-mockup (Gunungpati, Semarang).
import bcrypt from 'bcryptjs';
import { DELIVERY_FEE, GAS_FEE } from '@/lib/format';

export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    full_name     TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    phone         TEXT DEFAULT '',
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'buyer',
    avatar        TEXT DEFAULT '🙂',
    address       TEXT DEFAULT '',
    idr_balance   INTEGER DEFAULT 0,
    matic_balance REAL DEFAULT 0,
    wallet_address TEXT DEFAULT '',
    created_at    TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id    TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    emoji TEXT NOT NULL,
    sort  INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS merchants (
    id           TEXT PRIMARY KEY,
    owner_id     TEXT,
    name         TEXT NOT NULL,
    cat          TEXT,
    tags         TEXT DEFAULT '[]',
    address      TEXT,
    latitude     REAL,
    longitude    REAL,
    is_open      INTEGER DEFAULT 1,
    rating       REAL DEFAULT 4.5,
    rating_count INTEGER DEFAULT 0,
    eta          TEXT DEFAULT '15–25',
    distance     TEXT DEFAULT '1.0 km',
    accent       TEXT DEFAULT '#f97316',
    wallet_address TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id           TEXT PRIMARY KEY,
    merchant_id  TEXT NOT NULL,
    name         TEXT NOT NULL,
    price        INTEGER NOT NULL,
    popular      INTEGER DEFAULT 0,
    is_available INTEGER DEFAULT 1,
    description  TEXT DEFAULT '',
    FOREIGN KEY (merchant_id) REFERENCES merchants(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id               TEXT PRIMARY KEY,
    buyer_id         TEXT,
    merchant_id      TEXT NOT NULL,
    driver_id        TEXT,
    subtotal         INTEGER NOT NULL,
    delivery_fee     INTEGER NOT NULL,
    gas_fee          INTEGER NOT NULL,
    total            INTEGER NOT NULL,
    status           TEXT DEFAULT 'paid',
    delivery_address TEXT,
    delivery_lat     REAL,
    delivery_lng     REAL,
    note             TEXT DEFAULT '',
    tx_hash          TEXT,
    settle_tx_hash   TEXT,
    created_at       TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (merchant_id) REFERENCES merchants(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    name     TEXT NOT NULL,
    qty      INTEGER NOT NULL,
    price    INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id    TEXT NOT NULL,
    sender_id   TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    body        TEXT NOT NULL,
    created_at  TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS app_meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    TEXT NOT NULL,
    endpoint   TEXT NOT NULL UNIQUE,
    p256dh     TEXT NOT NULL,
    auth       TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_menu_merchant  ON menu_items(merchant_id);
  CREATE INDEX IF NOT EXISTS idx_orders_merchant ON orders(merchant_id);
  CREATE INDEX IF NOT EXISTS idx_orders_buyer    ON orders(buyer_id);
  CREATE INDEX IF NOT EXISTS idx_orders_driver   ON orders(driver_id);
  CREATE INDEX IF NOT EXISTS idx_oitems_order    ON order_items(order_id);
  CREATE INDEX IF NOT EXISTS idx_messages_order  ON messages(order_id);
  CREATE INDEX IF NOT EXISTS idx_push_user      ON push_subscriptions(user_id);
`;

export const GUNUNGPATI_CENTER = [-7.068, 110.395];
export { DELIVERY_FEE, GAS_FEE };

export const CATEGORIES = [
  { id: 'nasi', label: 'Nasi', emoji: '🍚' },
  { id: 'ayam', label: 'Ayam', emoji: '🍗' },
  { id: 'bakso', label: 'Bakso', emoji: '🍜' },
  { id: 'mie', label: 'Mie', emoji: '🍝' },
  { id: 'minuman', label: 'Minuman', emoji: '🧋' },
  { id: 'jajanan', label: 'Jajanan', emoji: '🍢' },
];

const MERCHANTS = [
  { id: 'm1', owner_id: 'u_merchant', name: 'Warung Bu Sri', cat: 'nasi', tags: ['Nasi', 'Soto'], address: 'Jl. Raya Sekaran No.12, Gunungpati', latitude: -7.0685, longitude: 110.3935, is_open: 1, rating: 4.8, rating_count: 312, eta: '15–25', distance: '0.8 km', accent: '#f97316' },
  { id: 'm2', owner_id: 'u2', name: 'Nasi Goreng Pak Kumis', cat: 'nasi', tags: ['Nasgoreng', 'Mie'], address: 'Jl. Kalisegoro, Gunungpati', latitude: -7.0662, longitude: 110.3978, is_open: 1, rating: 4.6, rating_count: 189, eta: '20–30', distance: '1.4 km', accent: '#d97706' },
  { id: 'm3', owner_id: 'u3', name: 'Ayam Geprek Samb-bal', cat: 'ayam', tags: ['Ayam', 'Geprek'], address: 'Jl. Patemon Raya, Gunungpati', latitude: -7.0706, longitude: 110.3922, is_open: 0, rating: 4.7, rating_count: 421, eta: '20–30', distance: '1.1 km', accent: '#dc2626' },
  { id: 'm4', owner_id: 'u4', name: 'Bakso Sapi Mas Gandhi', cat: 'bakso', tags: ['Bakso', 'Mie Ayam'], address: 'Jl. Mangunsari, Gunungpati', latitude: -7.0639, longitude: 110.3962, is_open: 1, rating: 4.9, rating_count: 537, eta: '10–20', distance: '0.5 km', accent: '#b91c1c' },
  { id: 'm5', owner_id: 'u5', name: 'Kopi & Es Teh Unnes', cat: 'minuman', tags: ['Kopi', 'Es Teh'], address: 'Jl. Taman Siswa, Sekaran', latitude: -7.0699, longitude: 110.3991, is_open: 1, rating: 4.5, rating_count: 96, eta: '10–15', distance: '1.0 km', accent: '#0d9488' },
  { id: 'm6', owner_id: 'u6', name: 'Mie Ayam Pak Tug', cat: 'mie', tags: ['Mie Ayam', 'Pangsit'], address: 'Jl. Cempaka Sari, Sekaran', latitude: -7.0651, longitude: 110.3941, is_open: 1, rating: 4.7, rating_count: 264, eta: '15–25', distance: '0.6 km', accent: '#ca8a04' },
];

const MENU = {
  m1: [
    { id: 'm1a', name: 'Nasi Rames Komplit', price: 13000, popular: 1, is_available: 1, description: 'Nasi, ayam, telur, sayur, sambal' },
    { id: 'm1b', name: 'Soto Ayam Semarang', price: 14000, popular: 1, is_available: 1, description: 'Kuah bening, suwiran ayam, soun' },
    { id: 'm1c', name: 'Pecel Sayur', price: 10000, popular: 0, is_available: 1, description: 'Sayur rebus, bumbu kacang' },
    { id: 'm1d', name: 'Tempe & Tahu Bacem', price: 5000, popular: 0, is_available: 1, description: 'Per porsi (3 pcs)' },
    { id: 'm1e', name: 'Es Teh Manis', price: 4000, popular: 0, is_available: 1, description: 'Dingin segar' },
    { id: 'm1f', name: 'Gorengan (5 pcs)', price: 6000, popular: 0, is_available: 0, description: 'Bakwan, tempe, tahu isi' },
  ],
  m2: [
    { id: 'm2a', name: 'Nasi Goreng Spesial', price: 16000, popular: 1, is_available: 1, description: 'Telur, ayam, bakso, kerupuk' },
    { id: 'm2b', name: 'Nasi Goreng Biasa', price: 12000, popular: 0, is_available: 1, description: 'Telur, kerupuk' },
    { id: 'm2c', name: 'Mie Goreng Jawa', price: 14000, popular: 1, is_available: 1, description: 'Mie kuning, sayur, telur' },
    { id: 'm2d', name: 'Es Jeruk', price: 5000, popular: 0, is_available: 1, description: 'Jeruk peras asli' },
  ],
  m3: [
    { id: 'm3a', name: 'Geprek Sambal Bawang', price: 15000, popular: 1, is_available: 1, description: 'Ayam crispy + nasi' },
    { id: 'm3b', name: 'Geprek Keju Mozza', price: 20000, popular: 1, is_available: 1, description: 'Leleh + sambal matah' },
    { id: 'm3c', name: 'Ayam Crispy Polos', price: 13000, popular: 0, is_available: 1, description: 'Tanpa sambal' },
    { id: 'm3d', name: 'Es Teh Jumbo', price: 5000, popular: 0, is_available: 1, description: '500ml' },
  ],
  m4: [
    { id: 'm4a', name: 'Bakso Urat Jumbo', price: 18000, popular: 1, is_available: 1, description: '2 bakso urat besar + mie' },
    { id: 'm4b', name: 'Bakso Campur', price: 15000, popular: 1, is_available: 1, description: 'Halus, urat, tahu, pangsit' },
    { id: 'm4c', name: 'Mie Ayam Bakso', price: 16000, popular: 0, is_available: 1, description: 'Mie ayam + 2 bakso' },
    { id: 'm4d', name: 'Es Teh / Teh Anget', price: 4000, popular: 0, is_available: 1, description: 'Pilih dingin / panas' },
  ],
  m5: [
    { id: 'm5a', name: 'Kopi Susu Gula Aren', price: 14000, popular: 1, is_available: 1, description: 'Es, signature' },
    { id: 'm5b', name: 'Es Teh Leci', price: 10000, popular: 1, is_available: 1, description: 'Manis segar' },
    { id: 'm5c', name: 'Americano', price: 12000, popular: 0, is_available: 1, description: 'Panas / dingin' },
    { id: 'm5d', name: 'Matcha Latte', price: 16000, popular: 0, is_available: 1, description: 'Es, creamy' },
  ],
  m6: [
    { id: 'm6a', name: 'Mie Ayam Spesial', price: 14000, popular: 1, is_available: 1, description: 'Ayam, pangsit goreng, bakso' },
    { id: 'm6b', name: 'Mie Ayam Biasa', price: 11000, popular: 0, is_available: 1, description: 'Topping ayam' },
    { id: 'm6c', name: 'Pangsit Rebus', price: 8000, popular: 0, is_available: 1, description: 'Isi 5' },
    { id: 'm6d', name: 'Es Jeruk Nipis', price: 6000, popular: 0, is_available: 1, description: 'Asam segar' },
  ],
};

// Akun demo (password: demo123).
const DEMO_USERS = [
  { id: 'u_merchant', full_name: 'Bu Sri', email: 'merchant@demo.test', role: 'merchant', avatar: '🍔', phone: '0812-2200-1100', idr_balance: 1240000, matic_balance: 182.4 },
  { id: 'u_buyer', full_name: 'Rina Pratiwi', email: 'buyer@demo.test', role: 'buyer', avatar: '👩', phone: '0813-9000-7788', address: 'Kos Putri Melati, Jl. Cempaka Sari No.7', idr_balance: 84500, matic_balance: 12.4 },
  { id: 'u_driver', full_name: 'Andi Saputra', email: 'driver@demo.test', role: 'driver', avatar: '🏍️', phone: '0812-3148-5566', idr_balance: 327000, matic_balance: 48.1 },
];

function minsAgo(m) {
  return new Date(Date.now() - m * 60000).toISOString();
}

// Pesanan awal untuk dashboard merchant & driver.
const SEED_ORDERS = [
  { id: 'a1b2c3d4e5f6', merchant_id: 'm1', driver_id: null, subtotal: 27000, delivery_fee: 6000, gas_fee: 1500, total: 34500, delivery_address: 'Kos Putri Melati, Jl. Cempaka Sari', delivery_lat: -7.0651, delivery_lng: 110.3941, status: 'paid', created_at: minsAgo(4), items: [{ name: 'Nasi Rames Komplit', qty: 1, price: 13000 }, { name: 'Soto Ayam Semarang', qty: 1, price: 14000 }] },
  { id: 'b2c3d4e5f6a7', merchant_id: 'm1', driver_id: null, subtotal: 18000, delivery_fee: 5000, gas_fee: 1500, total: 24500, delivery_address: 'Gedung H FMIPA Unnes', delivery_lat: -7.0506, delivery_lng: 110.3963, status: 'ready_for_pickup', created_at: minsAgo(11), items: [{ name: 'Soto Ayam Semarang', qty: 1, price: 14000 }, { name: 'Es Teh Manis', qty: 1, price: 4000 }] },
  { id: 'c3d4e5f6a7b8', merchant_id: 'm1', driver_id: null, subtotal: 41000, delivery_fee: 8000, gas_fee: 1500, total: 50500, delivery_address: 'Asrama Mahasiswa, Jl. Kalimasada', delivery_lat: -7.0672, delivery_lng: 110.4005, status: 'accepted_merchant', created_at: minsAgo(18), items: [{ name: 'Nasi Rames Komplit', qty: 3, price: 13000 }] },
  { id: 'd4e5f6a7b8c9', merchant_id: 'm1', driver_id: 'u_driver', subtotal: 22000, delivery_fee: 6000, gas_fee: 1500, total: 29500, delivery_address: 'Kontrakan Biru, Jl. Patemon Raya', delivery_lat: -7.0709, delivery_lng: 110.3925, status: 'picked_up', created_at: minsAgo(26), items: [{ name: 'Pecel Sayur', qty: 2, price: 10000 }] },
  { id: 'e5f6a7b8c9d0', merchant_id: 'm1', driver_id: null, subtotal: 15000, delivery_fee: 5000, gas_fee: 1500, total: 21500, delivery_address: 'Masjid Ulul Albab Unnes', delivery_lat: -7.0512, delivery_lng: 110.3951, status: 'paid', created_at: minsAgo(33), items: [{ name: 'Soto Ayam Semarang', qty: 1, price: 14000 }] },
];

export function seed(db) {
  const insCat = db.prepare('INSERT INTO categories (id, label, emoji, sort) VALUES (?, ?, ?, ?)');
  CATEGORIES.forEach((c, i) => insCat.run(c.id, c.label, c.emoji, i));

  const insUser = db.prepare(
    `INSERT INTO users (id, full_name, email, phone, password_hash, role, avatar, address, idr_balance, matic_balance)
     VALUES (@id, @full_name, @email, @phone, @password_hash, @role, @avatar, @address, @idr_balance, @matic_balance)`
  );
  const hash = bcrypt.hashSync('demo123', 10);
  DEMO_USERS.forEach((u) =>
    insUser.run({ phone: '', address: '', matic_balance: 0, idr_balance: 0, ...u, password_hash: hash })
  );

  const insMerchant = db.prepare(
    `INSERT INTO merchants (id, owner_id, name, cat, tags, address, latitude, longitude, is_open, rating, rating_count, eta, distance, accent)
     VALUES (@id, @owner_id, @name, @cat, @tags, @address, @latitude, @longitude, @is_open, @rating, @rating_count, @eta, @distance, @accent)`
  );
  MERCHANTS.forEach((m) => insMerchant.run({ ...m, tags: JSON.stringify(m.tags) }));

  const insMenu = db.prepare(
    `INSERT INTO menu_items (id, merchant_id, name, price, popular, is_available, description)
     VALUES (@id, @merchant_id, @name, @price, @popular, @is_available, @description)`
  );
  Object.entries(MENU).forEach(([mid, items]) =>
    items.forEach((it) => insMenu.run({ ...it, merchant_id: mid }))
  );

  const insOrder = db.prepare(
    `INSERT INTO orders (id, buyer_id, merchant_id, driver_id, subtotal, delivery_fee, gas_fee, total, status, delivery_address, delivery_lat, delivery_lng, tx_hash, created_at)
     VALUES (@id, @buyer_id, @merchant_id, @driver_id, @subtotal, @delivery_fee, @gas_fee, @total, @status, @delivery_address, @delivery_lat, @delivery_lng, @tx_hash, @created_at)`
  );
  const insItem = db.prepare('INSERT INTO order_items (order_id, name, qty, price) VALUES (?, ?, ?, ?)');
  SEED_ORDERS.forEach((o) => {
    insOrder.run({
      buyer_id: 'u_buyer',
      tx_hash: '0x' + Math.random().toString(16).slice(2).padEnd(40, '0'),
      ...o,
    });
    o.items.forEach((it) => insItem.run(o.id, it.name, it.qty, it.price));
  });
}
