// ---- Pesanin demo data (Gunungpati, Semarang) ----
const GUNUNGPATI_CENTER = [-7.0680, 110.3950];

// Food categories (chips on buyer home)
const CATEGORIES = [
  { id: 'nasi',    label: 'Nasi',    emoji: '🍚' },
  { id: 'ayam',    label: 'Ayam',    emoji: '🍗' },
  { id: 'bakso',   label: 'Bakso',   emoji: '🍜' },
  { id: 'mie',     label: 'Mie',     emoji: '🍝' },
  { id: 'minuman', label: 'Minuman', emoji: '🧋' },
  { id: 'jajanan', label: 'Jajanan', emoji: '🍢' },
];

const DEMO_MERCHANTS = [
  { id: 'm1', owner_id: 'u_merchant', name: 'Warung Bu Sri',         cat: 'nasi',    tags: ['Nasi', 'Soto'],         address: 'Jl. Raya Sekaran No.12, Gunungpati', latitude: -7.0685, longitude: 110.3935, is_open: true,  rating: 4.8, ratingCount: 312, eta: '15–25', distance: '0.8 km', accent: '#f97316' },
  { id: 'm2', owner_id: 'u2',         name: 'Nasi Goreng Pak Kumis', cat: 'nasi',    tags: ['Nasgoreng', 'Mie'],     address: 'Jl. Kalisegoro, Gunungpati',         latitude: -7.0662, longitude: 110.3978, is_open: true,  rating: 4.6, ratingCount: 189, eta: '20–30', distance: '1.4 km', accent: '#d97706' },
  { id: 'm3', owner_id: 'u3',         name: 'Ayam Geprek Samb-bal',  cat: 'ayam',    tags: ['Ayam', 'Geprek'],       address: 'Jl. Patemon Raya, Gunungpati',       latitude: -7.0706, longitude: 110.3922, is_open: false, rating: 4.7, ratingCount: 421, eta: '20–30', distance: '1.1 km', accent: '#dc2626' },
  { id: 'm4', owner_id: 'u4',         name: 'Bakso Sapi Mas Gandhi', cat: 'bakso',   tags: ['Bakso', 'Mie Ayam'],    address: 'Jl. Mangunsari, Gunungpati',         latitude: -7.0639, longitude: 110.3962, is_open: true,  rating: 4.9, ratingCount: 537, eta: '10–20', distance: '0.5 km', accent: '#b91c1c' },
  { id: 'm5', owner_id: 'u5',         name: 'Kopi & Es Teh Unnes',   cat: 'minuman', tags: ['Kopi', 'Es Teh'],       address: 'Jl. Taman Siswa, Sekaran',           latitude: -7.0699, longitude: 110.3991, is_open: true,  rating: 4.5, ratingCount: 96,  eta: '10–15', distance: '1.0 km', accent: '#0d9488' },
  { id: 'm6', owner_id: 'u6',         name: 'Mie Ayam Pak Tug',      cat: 'mie',     tags: ['Mie Ayam', 'Pangsit'],  address: 'Jl. Cempaka Sari, Sekaran',          latitude: -7.0651, longitude: 110.3941, is_open: true,  rating: 4.7, ratingCount: 264, eta: '15–25', distance: '0.6 km', accent: '#ca8a04' },
];

const DEMO_MENU = {
  m1: [
    { id: 'm1a', name: 'Nasi Rames Komplit', price: 13000, popular: true,  is_available: true,  desc: 'Nasi, ayam, telur, sayur, sambal' },
    { id: 'm1b', name: 'Soto Ayam Semarang', price: 14000, popular: true,  is_available: true,  desc: 'Kuah bening, suwiran ayam, soun' },
    { id: 'm1c', name: 'Pecel Sayur',        price: 10000, popular: false, is_available: true,  desc: 'Sayur rebus, bumbu kacang' },
    { id: 'm1d', name: 'Tempe & Tahu Bacem', price: 5000,  popular: false, is_available: true,  desc: 'Per porsi (3 pcs)' },
    { id: 'm1e', name: 'Es Teh Manis',       price: 4000,  popular: false, is_available: true,  desc: 'Dingin segar' },
    { id: 'm1f', name: 'Gorengan (5 pcs)',   price: 6000,  popular: false, is_available: false, desc: 'Bakwan, tempe, tahu isi' },
  ],
  m2: [
    { id: 'm2a', name: 'Nasi Goreng Spesial', price: 16000, popular: true,  is_available: true, desc: 'Telur, ayam, bakso, kerupuk' },
    { id: 'm2b', name: 'Nasi Goreng Biasa',   price: 12000, popular: false, is_available: true, desc: 'Telur, kerupuk' },
    { id: 'm2c', name: 'Mie Goreng Jawa',     price: 14000, popular: true,  is_available: true, desc: 'Mie kuning, sayur, telur' },
    { id: 'm2d', name: 'Es Jeruk',            price: 5000,  popular: false, is_available: true, desc: 'Jeruk peras asli' },
  ],
  m3: [
    { id: 'm3a', name: 'Geprek Sambal Bawang', price: 15000, popular: true,  is_available: true, desc: 'Ayam crispy + nasi' },
    { id: 'm3b', name: 'Geprek Keju Mozza',    price: 20000, popular: true,  is_available: true, desc: 'Leleh + sambal matah' },
    { id: 'm3c', name: 'Ayam Crispy Polos',    price: 13000, popular: false, is_available: true, desc: 'Tanpa sambal' },
    { id: 'm3d', name: 'Es Teh Jumbo',         price: 5000,  popular: false, is_available: true, desc: '500ml' },
  ],
  m4: [
    { id: 'm4a', name: 'Bakso Urat Jumbo', price: 18000, popular: true,  is_available: true, desc: '2 bakso urat besar + mie' },
    { id: 'm4b', name: 'Bakso Campur',     price: 15000, popular: true,  is_available: true, desc: 'Halus, urat, tahu, pangsit' },
    { id: 'm4c', name: 'Mie Ayam Bakso',   price: 16000, popular: false, is_available: true, desc: 'Mie ayam + 2 bakso' },
    { id: 'm4d', name: 'Es Teh / Teh Anget', price: 4000, popular: false, is_available: true, desc: 'Pilih dingin / panas' },
  ],
  m5: [
    { id: 'm5a', name: 'Kopi Susu Gula Aren', price: 14000, popular: true,  is_available: true, desc: 'Es, signature' },
    { id: 'm5b', name: 'Es Teh Leci',         price: 10000, popular: true,  is_available: true, desc: 'Manis segar' },
    { id: 'm5c', name: 'Americano',           price: 12000, popular: false, is_available: true, desc: 'Panas / dingin' },
    { id: 'm5d', name: 'Matcha Latte',        price: 16000, popular: false, is_available: true, desc: 'Es, creamy' },
  ],
  m6: [
    { id: 'm6a', name: 'Mie Ayam Spesial', price: 14000, popular: true,  is_available: true, desc: 'Ayam, pangsit goreng, bakso' },
    { id: 'm6b', name: 'Mie Ayam Biasa',   price: 11000, popular: false, is_available: true, desc: 'Topping ayam' },
    { id: 'm6c', name: 'Pangsit Rebus',    price: 8000,  popular: false, is_available: true, desc: 'Isi 5' },
    { id: 'm6d', name: 'Es Jeruk Nipis',   price: 6000,  popular: false, is_available: true, desc: 'Asam segar' },
  ],
};

// Status labels for order lifecycle (buyer-facing, Indonesian)
const STATUS_FLOW = ['paid', 'accepted_merchant', 'ready_for_pickup', 'picked_up', 'delivered'];
const STATUS_LABEL = {
  paid:              'Menunggu konfirmasi',
  accepted_merchant: 'Pesanan disiapkan',
  ready_for_pickup:  'Siap diambil driver',
  picked_up:         'Driver mengantar',
  delivered:         'Pesanan selesai',
};

const now = Date.now();
const mins = (m) => new Date(now - m * 60000).toISOString();

// Seed orders (merchant + driver dashboards)
const DEMO_ORDERS = [
  { id: 'a1b2c3d4e5f6', merchant_id: 'm1', driver_id: null,       subtotal: 27000, delivery_fee: 6000, total: 33500, delivery_address: 'Kos Putri Melati, Jl. Cempaka Sari',  status: 'paid',              created_at: mins(4)  },
  { id: 'b2c3d4e5f6a7', merchant_id: 'm1', driver_id: null,       subtotal: 18000, delivery_fee: 5000, total: 23400, delivery_address: 'Gedung H FMIPA Unnes',                status: 'ready_for_pickup',  created_at: mins(11) },
  { id: 'c3d4e5f6a7b8', merchant_id: 'm1', driver_id: null,       subtotal: 41000, delivery_fee: 8000, total: 49600, delivery_address: 'Asrama Mahasiswa, Jl. Kalimasada',     status: 'accepted_merchant', created_at: mins(18) },
  { id: 'd4e5f6a7b8c9', merchant_id: 'm1', driver_id: 'u_driver', subtotal: 22000, delivery_fee: 6000, total: 28200, delivery_address: 'Kontrakan Biru, Jl. Patemon Raya',     status: 'picked_up',         created_at: mins(26) },
  { id: 'e5f6a7b8c9d0', merchant_id: 'm1', driver_id: null,       subtotal: 15000, delivery_fee: 5000, total: 20300, delivery_address: 'Masjid Ulul Albab Unnes',             status: 'paid',              created_at: mins(33) },
];

// Past buyer orders (riwayat)
const DEMO_HISTORY = [
  { id: 'p1q2r3s4', merchant_id: 'm4', items: [{ name: 'Bakso Urat Jumbo', qty: 1 }, { name: 'Es Teh', qty: 1 }], total: 28200, status: 'delivered', created_at: mins(1440) },
  { id: 'p5q6r7s8', merchant_id: 'm5', items: [{ name: 'Kopi Susu Gula Aren', qty: 2 }], total: 33400, status: 'delivered', created_at: mins(2880) },
  { id: 'p9q0r1s2', merchant_id: 'm2', items: [{ name: 'Nasi Goreng Spesial', qty: 1 }], total: 22300, status: 'delivered', created_at: mins(5760) },
];

const DELIVERY_FEE = 6000;
const GAS_FEE = 1500; // biaya jaringan (gas) Polygon

Object.assign(window, {
  GUNUNGPATI_CENTER, CATEGORIES, DEMO_MERCHANTS, DEMO_MENU, DEMO_ORDERS, DEMO_HISTORY,
  STATUS_FLOW, STATUS_LABEL, DELIVERY_FEE, GAS_FEE,
});
