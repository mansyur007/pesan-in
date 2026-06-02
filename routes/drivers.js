const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, (req, res) => {
  const db = getDB();
  const drivers = db.prepare(`
    SELECT dp.*, u.name, u.phone, u.avatar, u.email
    FROM driver_profiles dp
    JOIN users u ON dp.user_id = u.id
    ORDER BY dp.rating DESC, dp.total_trips DESC
  `).all();
  res.json(drivers);
});

router.get('/me', requireAuth, (req, res) => {
  const db = getDB();
  const profile = db.prepare('SELECT * FROM driver_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profil driver tidak ditemukan' });
  res.json(profile);
});

router.put('/me', requireAuth, (req, res) => {
  const { vehicle_type, vehicle_plate, vehicle_model, price_per_km, base_price, bio, is_available } = req.body;
  const db = getDB();
  const existing = db.prepare('SELECT * FROM driver_profiles WHERE user_id = ?').get(req.user.id);
  if (!existing) {
    db.prepare('INSERT INTO driver_profiles (user_id, vehicle_type, vehicle_plate, vehicle_model, price_per_km, base_price, bio, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(req.user.id, vehicle_type || 'motor', vehicle_plate || '', vehicle_model || '', price_per_km || 3000, base_price || 5000, bio || '', is_available ?? 1);
  } else {
    db.prepare(`UPDATE driver_profiles SET
      vehicle_type=?, vehicle_plate=?, vehicle_model=?,
      price_per_km=?, base_price=?, bio=?, is_available=?
      WHERE user_id=?`)
      .run(
        vehicle_type ?? existing.vehicle_type,
        vehicle_plate ?? existing.vehicle_plate,
        vehicle_model ?? existing.vehicle_model,
        price_per_km ?? existing.price_per_km,
        base_price ?? existing.base_price,
        bio ?? existing.bio,
        is_available ?? existing.is_available,
        req.user.id
      );
  }
  // ensure role is driver
  db.prepare("UPDATE users SET role='driver' WHERE id=?").run(req.user.id);
  res.json({ success: true });
});

router.post('/book', requireAuth, (req, res) => {
  const { driver_id, pickup_address, dropoff_address, distance_km = 1, notes = '' } = req.body;
  if (!driver_id || !pickup_address || !dropoff_address) return res.status(400).json({ error: 'Lengkapi data pemesanan' });
  const db = getDB();
  const driver = db.prepare('SELECT dp.*, u.name as driver_name FROM driver_profiles dp JOIN users u ON dp.user_id = u.id WHERE dp.id = ? AND dp.is_available = 1').get(driver_id);
  if (!driver) return res.status(404).json({ error: 'Driver tidak tersedia' });
  const total_price = Math.round(driver.base_price + driver.price_per_km * distance_km);
  const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(req.user.id);
  if (!wallet || wallet.idr_balance < total_price) return res.status(400).json({ error: `Saldo tidak cukup. Butuh ${total_price}` });
  const doBook = db.transaction(() => {
    const { lastInsertRowid } = db.prepare(
      'INSERT INTO driver_orders (driver_id, customer_id, pickup_address, dropoff_address, distance_km, total_price, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(driver.id, req.user.id, pickup_address, dropoff_address, distance_km, total_price, notes);
    db.prepare('UPDATE wallets SET idr_balance = idr_balance - ? WHERE user_id = ?').run(total_price, req.user.id);
    db.prepare('UPDATE wallets SET idr_balance = idr_balance + ? WHERE user_id = ?').run(total_price, driver.user_id);
    const ref = `DO-${lastInsertRowid}`;
    db.prepare('INSERT INTO wallet_transactions (user_id, type, currency, amount, description, ref_code) VALUES (?, ?, ?, ?, ?, ?)')
      .run(req.user.id, 'payment', 'IDR', total_price, `Booking driver ${driver.driver_name}`, ref);
    db.prepare('INSERT INTO wallet_transactions (user_id, type, currency, amount, description, ref_code) VALUES (?, ?, ?, ?, ?, ?)')
      .run(driver.user_id, 'earning', 'IDR', total_price, `Trip dari customer`, ref);
    return lastInsertRowid;
  });
  const bookingId = doBook();
  res.json({ success: true, booking_id: bookingId, total_price, driver_name: driver.driver_name });
});

router.get('/bookings', requireAuth, (req, res) => {
  const db = getDB();
  const bookings = db.prepare(`
    SELECT do.*, u.name as driver_name, u.phone as driver_phone, u.avatar as driver_avatar,
           dp.vehicle_type, dp.vehicle_model, dp.vehicle_plate
    FROM driver_orders do
    JOIN driver_profiles dp ON do.driver_id = dp.id
    JOIN users u ON dp.user_id = u.id
    WHERE do.customer_id = ?
    ORDER BY do.created_at DESC
  `).all(req.user.id);
  res.json(bookings);
});

router.get('/orders', requireAuth, (req, res) => {
  const db = getDB();
  const profile = db.prepare('SELECT * FROM driver_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(403).json({ error: 'Bukan driver' });
  const orders = db.prepare(`
    SELECT do.*, u.name as customer_name, u.phone as customer_phone, u.avatar as customer_avatar
    FROM driver_orders do
    JOIN users u ON do.customer_id = u.id
    WHERE do.driver_id = ?
    ORDER BY do.created_at DESC
  `).all(profile.id);
  res.json(orders);
});

router.put('/orders/:id/status', requireAuth, (req, res) => {
  const { status } = req.body;
  const valid = ['accepted', 'picked_up', 'delivered', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Status tidak valid' });
  const db = getDB();
  const profile = db.prepare('SELECT id FROM driver_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(403).json({ error: 'Bukan driver' });
  const order = db.prepare('SELECT * FROM driver_orders WHERE id = ? AND driver_id = ?').get(req.params.id, profile.id);
  if (!order) return res.status(404).json({ error: 'Order tidak ditemukan' });
  db.prepare('UPDATE driver_orders SET status = ? WHERE id = ?').run(status, req.params.id);
  if (status === 'delivered') {
    db.prepare('UPDATE driver_profiles SET total_trips = total_trips + 1 WHERE id = ?').run(profile.id);
  }
  res.json({ success: true });
});

module.exports = router;
