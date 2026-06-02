const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { optionalAuth, requireAuth } = require('../middleware/auth');

function genCode() {
  return 'GF-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
}

router.get('/user/history', requireAuth, (req, res) => {
  const db = getDB();
  const orders = db.prepare(`
    SELECT o.*, r.name as restaurant_name
    FROM orders o JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `).all(req.user.id);
  res.json(orders);
});

router.post('/', optionalAuth, (req, res) => {
  const db = getDB();
  const { customer_name, customer_phone, customer_address, restaurant_id, items, notes, payment_method = 'cash' } = req.body;
  if (!customer_name || !customer_phone || !customer_address || !restaurant_id || !items?.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(restaurant_id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

  let subtotal = 0;
  const orderItems = [];
  for (const item of items) {
    const mi = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(item.id);
    if (!mi || !mi.is_available) return res.status(400).json({ error: `Item "${item.name}" not available` });
    const s = mi.price * item.quantity;
    subtotal += s;
    orderItems.push({ menu_item_id: mi.id, menu_item_name: mi.name, quantity: item.quantity, unit_price: mi.price, subtotal: s });
  }

  const delivery_fee = restaurant.delivery_fee;
  const total = subtotal + delivery_fee;
  const order_code = genCode();

  const userId = req.user ? req.user.id : null;

  if (payment_method === 'wallet') {
    if (!userId) return res.status(401).json({ error: 'Login diperlukan untuk bayar dengan dompet' });
    const wallet = db.prepare('SELECT idr_balance FROM wallets WHERE user_id = ?').get(userId);
    if (!wallet || wallet.idr_balance < total) {
      return res.status(400).json({ error: `Saldo tidak cukup. Saldo kamu: ${wallet ? 'Rp ' + wallet.idr_balance.toLocaleString('id-ID') : '0'}` });
    }
  }

  const create = db.transaction(() => {
    const { lastInsertRowid } = db.prepare(`INSERT INTO orders (order_code, customer_name, customer_phone, customer_address, restaurant_id, subtotal, delivery_fee, total, notes, user_id, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(order_code, customer_name, customer_phone, customer_address, restaurant_id, subtotal, delivery_fee, total, notes || '', userId, payment_method);
    const ins = db.prepare('INSERT INTO order_items (order_id, menu_item_id, menu_item_name, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)');
    orderItems.forEach(i => ins.run(lastInsertRowid, i.menu_item_id, i.menu_item_name, i.quantity, i.unit_price, i.subtotal));
  });

  try {
    create();
    // Deduct wallet if paying by wallet
    if (payment_method === 'wallet' && userId) {
      db.prepare('UPDATE wallets SET idr_balance = idr_balance - ? WHERE user_id = ?').run(total, userId);
      db.prepare('INSERT INTO wallet_transactions (user_id, type, currency, amount, description, ref_code) VALUES (?, ?, ?, ?, ?, ?)')
        .run(userId, 'payment', 'IDR', total, `Pembayaran ke ${restaurant.name}`, order_code);
    }
    // Credit GFC to logged-in user (1 GFC per Rp 5,000 spent)
    if (userId) {
      const gfc = Math.floor(total / 5000);
      if (gfc > 0) {
        db.prepare('UPDATE wallets SET gfc_balance = gfc_balance + ? WHERE user_id = ?').run(gfc, userId);
        db.prepare('INSERT INTO wallet_transactions (user_id, type, currency, amount, description, ref_code) VALUES (?, ?, ?, ?, ?, ?)')
          .run(userId, 'earning', 'GFC', gfc, `Reward dari pesanan`, order_code);
      }
    }
    res.json({ success: true, order_code, subtotal, delivery_fee, total });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/restaurant/:restaurantId', (req, res) => {
  const db = getDB();
  const { status } = req.query;
  let q = 'SELECT * FROM orders WHERE restaurant_id = ?';
  const p = [req.params.restaurantId];
  if (status && status !== 'all') { q += ' AND status = ?'; p.push(status); }
  q += ' ORDER BY created_at DESC';
  res.json(db.prepare(q).all(...p));
});

router.get('/:code', (req, res) => {
  const db = getDB();
  const order = db.prepare(`SELECT o.*, r.name as restaurant_name, r.address as restaurant_address FROM orders o JOIN restaurants r ON o.restaurant_id = r.id WHERE o.order_code = ?`).get(req.params.code);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ ...order, items });
});

router.put('/:code/status', (req, res) => {
  const db = getDB();
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const r = db.prepare('UPDATE orders SET status = ? WHERE order_code = ?').run(status, req.params.code);
  if (r.changes === 0) return res.status(404).json({ error: 'Order not found' });
  res.json({ success: true, status });
});

module.exports = router;
