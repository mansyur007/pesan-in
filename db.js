const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'pesanin.db');
let db;

function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDB() {
  const db = getDB();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      avatar TEXT DEFAULT '😊',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      idr_balance INTEGER DEFAULT 0,
      gfc_balance REAL DEFAULT 0,
      usdt_balance REAL DEFAULT 0,
      btc_balance REAL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      currency TEXT DEFAULT 'IDR',
      amount REAL NOT NULL,
      description TEXT DEFAULT '',
      ref_code TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS driver_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      vehicle_type TEXT DEFAULT 'motor',
      vehicle_plate TEXT DEFAULT '',
      vehicle_model TEXT DEFAULT '',
      price_per_km INTEGER DEFAULT 3000,
      base_price INTEGER DEFAULT 5000,
      is_available INTEGER DEFAULT 1,
      rating REAL DEFAULT 5.0,
      total_trips INTEGER DEFAULT 0,
      bio TEXT DEFAULT '',
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS driver_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      pickup_address TEXT NOT NULL,
      dropoff_address TEXT NOT NULL,
      distance_km REAL DEFAULT 1.0,
      total_price INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (driver_id) REFERENCES driver_profiles(id),
      FOREIGN KEY (customer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      category_id INTEGER,
      image_url TEXT,
      rating REAL DEFAULT 4.0,
      review_count INTEGER DEFAULT 0,
      delivery_time_min INTEGER DEFAULT 15,
      delivery_time_max INTEGER DEFAULT 30,
      min_order INTEGER DEFAULT 10000,
      delivery_fee INTEGER DEFAULT 3000,
      is_open INTEGER DEFAULT 1,
      address TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS menu_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER NOT NULL,
      menu_category_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      is_available INTEGER DEFAULT 1,
      is_popular INTEGER DEFAULT 0,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
      FOREIGN KEY (menu_category_id) REFERENCES menu_categories(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      restaurant_id INTEGER NOT NULL,
      subtotal INTEGER NOT NULL,
      delivery_fee INTEGER NOT NULL,
      total INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_item_id INTEGER NOT NULL,
      menu_item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price INTEGER NOT NULL,
      subtotal INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );
  `);

  try { db.exec('ALTER TABLE orders ADD COLUMN user_id INTEGER'); } catch {}
  try { db.exec("ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'cash'"); } catch {}

  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (catCount.count === 0) seedData(db);

  return db;
}

function seedData(db) {
  const categories = [
    { name: 'Nasi & Lauk', icon: '🍱', slug: 'nasi' },
    { name: 'Mie & Pasta', icon: '🍜', slug: 'mie' },
    { name: 'Ayam', icon: '🍗', slug: 'ayam' },
    { name: 'Bakso & Soto', icon: '🍲', slug: 'bakso' },
    { name: 'Minuman', icon: '🥤', slug: 'minuman' },
    { name: 'Jajanan', icon: '🍢', slug: 'jajanan' },
    { name: 'Western', icon: '🍔', slug: 'western' },
    { name: 'Seafood', icon: '🦐', slug: 'seafood' },
  ];
  const insertCat = db.prepare('INSERT INTO categories (name, icon, slug) VALUES (?, ?, ?)');
  categories.forEach(c => insertCat.run(c.name, c.icon, c.slug));

  const restaurants = [
    { name: 'Warung Bu Sari', slug: 'warung-bu-sari', description: 'Masakan rumahan lezat dengan cita rasa autentik Jawa', category_id: 1, rating: 4.8, review_count: 234, delivery_time_min: 15, delivery_time_max: 25, min_order: 15000, delivery_fee: 2000, address: 'Jl. Mawar No. 12' },
    { name: 'Bakso Malang Pak Dhe', slug: 'bakso-pak-dhe', description: 'Bakso sapi premium dengan kuah gurih khas Malang', category_id: 4, rating: 4.7, review_count: 189, delivery_time_min: 20, delivery_time_max: 35, min_order: 20000, delivery_fee: 3000, address: 'Jl. Kenanga No. 5' },
    { name: 'Ayam Geprek Juara', slug: 'ayam-geprek-juara', description: 'Ayam geprek crispy dengan sambal level 1–10', category_id: 3, rating: 4.6, review_count: 312, delivery_time_min: 15, delivery_time_max: 30, min_order: 15000, delivery_fee: 2000, address: 'Jl. Anggrek No. 8' },
    { name: 'Mie Goreng 88', slug: 'mie-goreng-88', description: 'Mie goreng dan rebus dengan berbagai topping pilihan', category_id: 2, rating: 4.5, review_count: 156, delivery_time_min: 15, delivery_time_max: 25, min_order: 10000, delivery_fee: 2000, address: 'Jl. Melati No. 3' },
    { name: 'Es Campur Pak Joko', slug: 'es-campur-pak-joko', description: 'Minuman segar dan jajanan pasar pilihan', category_id: 5, rating: 4.4, review_count: 98, delivery_time_min: 10, delivery_time_max: 20, min_order: 10000, delivery_fee: 1500, address: 'Jl. Dahlia No. 15' },
    { name: 'Burger & Fries Corner', slug: 'burger-corner', description: 'Burger juicy dengan kentang goreng renyah', category_id: 7, rating: 4.3, review_count: 127, delivery_time_min: 20, delivery_time_max: 35, min_order: 25000, delivery_fee: 4000, address: 'Jl. Tulip No. 20' },
    { name: 'Sate Madura Pak Haji', slug: 'sate-pak-haji', description: 'Sate ayam dan kambing khas Madura yang legendaris', category_id: 3, rating: 4.9, review_count: 445, delivery_time_min: 25, delivery_time_max: 40, min_order: 20000, delivery_fee: 3000, address: 'Jl. Flamboyan No. 7' },
    { name: 'Seafood Bakar Mama Rosa', slug: 'seafood-mama-rosa', description: 'Ikan dan seafood segar dibakar dengan bumbu khas', category_id: 8, rating: 4.7, review_count: 203, delivery_time_min: 30, delivery_time_max: 45, min_order: 30000, delivery_fee: 5000, address: 'Jl. Nelayan No. 1' },
  ];
  const insertRest = db.prepare(`INSERT INTO restaurants (name, slug, description, category_id, rating, review_count, delivery_time_min, delivery_time_max, min_order, delivery_fee, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  restaurants.forEach(r => insertRest.run(r.name, r.slug, r.description, r.category_id, r.rating, r.review_count, r.delivery_time_min, r.delivery_time_max, r.min_order, r.delivery_fee, r.address));

  const menuCatData = [
    [1, 'Nasi', 1], [1, 'Lauk Pauk', 2], [1, 'Minuman', 3],
    [2, 'Bakso', 1], [2, 'Mie Ayam', 2], [2, 'Tambahan', 3],
    [3, 'Ayam Geprek', 1], [3, 'Paket Hemat', 2], [3, 'Minuman', 3],
    [4, 'Mie Goreng', 1], [4, 'Mie Rebus', 2], [4, 'Nasi Goreng', 3],
    [5, 'Es & Minuman', 1], [5, 'Jajanan', 2],
    [6, 'Burger', 1], [6, 'Snacks', 2], [6, 'Minuman', 3],
    [7, 'Sate', 1], [7, 'Lontong & Nasi', 2], [7, 'Minuman', 3],
    [8, 'Ikan Bakar', 1], [8, 'Seafood', 2], [8, 'Nasi & Pelengkap', 3],
  ];
  const insertMC = db.prepare('INSERT INTO menu_categories (restaurant_id, name, sort_order) VALUES (?, ?, ?)');
  menuCatData.forEach(([r, n, s]) => insertMC.run(r, n, s));

  // mc IDs: 1-3 = rest1, 4-6 = rest2, 7-9 = rest3, 10-12 = rest4, 13-14 = rest5, 15-17 = rest6, 18-20 = rest7, 21-23 = rest8
  const items = [
    // Warung Bu Sari
    [1, 1, 'Nasi Gudeg Komplit', 'Nasi gudeg dengan ayam, telur, krecek, dan tempe', 25000, 1],
    [1, 1, 'Nasi Campur Bu Sari', 'Nasi dengan pilihan 3 lauk sesuai selera', 20000, 1],
    [1, 1, 'Nasi Putih', 'Nasi putih pulen', 5000, 0],
    [1, 2, 'Ayam Goreng', 'Ayam kampung goreng renyah', 18000, 1],
    [1, 2, 'Tempe Orek Manis', 'Tempe orek manis pedas', 8000, 0],
    [1, 2, 'Telur Balado', 'Telur dengan sambal balado', 10000, 0],
    [1, 2, 'Sayur Lodeh', 'Sayur lodeh dengan santan gurih', 10000, 0],
    [1, 3, 'Es Teh Manis', 'Teh manis dingin segar', 5000, 1],
    [1, 3, 'Teh Hangat', 'Teh panas manis', 4000, 0],
    [1, 3, 'Jeruk Segar', 'Jeruk nipis peras', 6000, 0],
    // Bakso Pak Dhe
    [2, 4, 'Bakso Komplit', 'Bakso sapi, mie, tahu, pangsit goreng', 25000, 1],
    [2, 4, 'Bakso Biasa', 'Bakso sapi kuah gurih', 18000, 0],
    [2, 4, 'Bakso Urat', 'Bakso urat empuk kuah kaldu', 22000, 1],
    [2, 4, 'Bakso Bakar', 'Bakso dibakar bumbu kecap', 20000, 0],
    [2, 5, 'Mie Ayam Biasa', 'Mie dengan topping ayam dan jamur', 18000, 0],
    [2, 5, 'Mie Ayam Bakso', 'Mie ayam lengkap dengan bakso', 23000, 1],
    [2, 6, 'Pangsit Goreng', 'Pangsit crispy isi ayam', 8000, 0],
    [2, 6, 'Tahu Goreng', 'Tahu goreng renyah', 5000, 0],
    // Ayam Geprek Juara
    [3, 7, 'Geprek Level 1', 'Ayam geprek crispy sambal ringan', 18000, 1],
    [3, 7, 'Geprek Level 5', 'Ayam geprek pedas level 5', 18000, 1],
    [3, 7, 'Geprek Level 10', 'Ayam geprek super pedas level 10', 18000, 0],
    [3, 7, 'Geprek Keju', 'Ayam geprek dengan lelehan keju', 23000, 1],
    [3, 8, 'Paket Geprek + Nasi + Es Teh', 'Kombo hemat geprek nasi es teh', 25000, 1],
    [3, 8, 'Paket 2 Geprek + 2 Nasi', 'Paket berdua hemat', 40000, 0],
    [3, 9, 'Es Teh Manis', 'Es teh manis segar', 5000, 0],
    [3, 9, 'Es Jeruk', 'Es jeruk peras segar', 7000, 0],
    // Mie Goreng 88
    [4, 10, 'Mie Goreng Spesial', 'Mie goreng telur, bakso, sayuran', 18000, 1],
    [4, 10, 'Mie Goreng Seafood', 'Mie goreng udang dan cumi', 25000, 1],
    [4, 10, 'Mie Goreng Jawa', 'Mie goreng gaya Jawa dengan kecap', 15000, 0],
    [4, 11, 'Mie Rebus Spesial', 'Mie kuning rebus kuah gurih', 18000, 0],
    [4, 11, 'Mie Rebus Pedas', 'Mie rebus dengan kuah pedas', 18000, 1],
    [4, 12, 'Nasi Goreng Spesial', 'Nasi goreng telur, ayam, bakso', 20000, 1],
    // Es Campur Pak Joko
    [5, 13, 'Es Campur', 'Aneka buah, jeli, cincau, sirup', 12000, 1],
    [5, 13, 'Es Cendol', 'Cendol santan gula merah', 10000, 1],
    [5, 13, 'Es Teler', 'Alpukat, kelapa, nangka', 15000, 0],
    [5, 13, 'Jus Alpukat', 'Jus alpukat segar dengan susu', 15000, 0],
    [5, 14, 'Gorengan Campur (5 pcs)', 'Tempe, bakwan, pisang goreng', 10000, 1],
    [5, 14, 'Pisang Goreng Coklat', 'Pisang goreng topping coklat', 12000, 0],
    // Burger Corner
    [6, 15, 'Burger Classic', 'Beef patty, selada, tomat, keju', 30000, 1],
    [6, 15, 'Burger Spicy', 'Beef patty dengan saus pedas', 32000, 1],
    [6, 15, 'Burger Double Cheese', 'Double patty double keju', 40000, 0],
    [6, 16, 'French Fries', 'Kentang goreng renyah', 15000, 1],
    [6, 16, 'Onion Rings', 'Bawang goreng crispy', 18000, 0],
    [6, 17, 'Cola', 'Minuman cola dingin', 10000, 0],
    [6, 17, 'Milkshake Coklat', 'Milkshake coklat creamy', 25000, 1],
    // Sate Pak Haji
    [7, 18, 'Sate Ayam (10 tusuk)', 'Sate ayam bumbu kacang/kecap', 25000, 1],
    [7, 18, 'Sate Kambing (10 tusuk)', 'Sate kambing muda empuk', 35000, 1],
    [7, 18, 'Sate Campur (10 tusuk)', 'Mix sate ayam dan kambing', 30000, 1],
    [7, 19, 'Lontong Sate', 'Lontong dengan bumbu kacang', 8000, 0],
    [7, 19, 'Nasi + Sate Ayam', 'Nasi putih + sate ayam 10 tusuk', 30000, 0],
    [7, 20, 'Es Teh Tawar', 'Teh tawar dingin', 4000, 0],
    [7, 20, 'Air Mineral', 'Air mineral botol', 4000, 0],
    // Seafood Mama Rosa
    [8, 21, 'Ikan Bakar Gurame', 'Gurame segar dibakar bumbu rempah', 55000, 1],
    [8, 21, 'Ikan Bakar Nila', 'Nila bakar bumbu kecap', 35000, 1],
    [8, 21, 'Ikan Bakar Kakap', 'Kakap merah bakar bumbu rempah', 60000, 0],
    [8, 22, 'Udang Goreng Tepung', 'Udang segar goreng tepung renyah', 45000, 1],
    [8, 22, 'Cumi Bakar', 'Cumi bakar bumbu pedas manis', 40000, 0],
    [8, 22, 'Kepiting Saus Tiram', 'Kepiting masak saus tiram', 75000, 0],
    [8, 23, 'Nasi Putih', 'Nasi putih pulen', 5000, 0],
    [8, 23, 'Kangkung Tumis', 'Kangkung tumis bawang putih', 12000, 0],
  ];

  const insertItem = db.prepare(`INSERT INTO menu_items (restaurant_id, menu_category_id, name, description, price, is_available, is_popular) VALUES (?, ?, ?, ?, ?, 1, ?)`);
  items.forEach(([r, mc, n, d, p, pop]) => insertItem.run(r, mc, n, d, p, pop));
}

module.exports = { getDB, initDB };
