import { getDB } from './index';

const ACTIVE_BUYER_STATUSES = ['paid', 'accepted_merchant', 'ready_for_pickup', 'picked_up'];

function parseMerchant(m) {
  if (!m) return null;
  return { ...m, is_open: !!m.is_open, tags: safeTags(m.tags) };
}
function safeTags(raw) {
  try { return JSON.parse(raw || '[]'); } catch { return []; }
}
function parseMenuItem(it) {
  return { ...it, popular: !!it.popular, is_available: !!it.is_available };
}

export function listMerchants() {
  const db = getDB();
  const rows = db.prepare('SELECT * FROM merchants ORDER BY is_open DESC, rating DESC').all();
  return rows.map(parseMerchant);
}

export function getMerchant(id) {
  const db = getDB();
  return parseMerchant(db.prepare('SELECT * FROM merchants WHERE id = ?').get(id));
}

export function getMerchantByOwner(ownerId) {
  const db = getDB();
  return parseMerchant(db.prepare('SELECT * FROM merchants WHERE owner_id = ?').get(ownerId));
}

export function getMenu(merchantId) {
  const db = getDB();
  return db
    .prepare('SELECT * FROM menu_items WHERE merchant_id = ? ORDER BY popular DESC, price ASC')
    .all(merchantId)
    .map(parseMenuItem);
}

export function getCategories() {
  const db = getDB();
  return getDB().prepare('SELECT * FROM categories ORDER BY sort ASC').all();
}

function attachItems(order) {
  if (!order) return null;
  const db = getDB();
  const items = db.prepare('SELECT name, qty, price FROM order_items WHERE order_id = ?').all(order.id);
  const merchant = getMerchant(order.merchant_id);
  let driver = null;
  if (order.driver_id) {
    driver = db
      .prepare('SELECT id, full_name, phone, avatar FROM users WHERE id = ?')
      .get(order.driver_id) || null;
  }
  return { ...order, items, merchant, driver };
}

export function getOrder(id) {
  const db = getDB();
  return attachItems(db.prepare('SELECT * FROM orders WHERE id = ?').get(id));
}

export function getActiveOrderForBuyer(buyerId) {
  const db = getDB();
  const placeholders = ACTIVE_BUYER_STATUSES.map(() => '?').join(',');
  const row = db
    .prepare(`SELECT * FROM orders WHERE buyer_id = ? AND status IN (${placeholders}) ORDER BY created_at DESC LIMIT 1`)
    .get(buyerId, ...ACTIVE_BUYER_STATUSES);
  return attachItems(row);
}

export function getOrderHistoryForBuyer(buyerId) {
  const db = getDB();
  const rows = db
    .prepare("SELECT * FROM orders WHERE buyer_id = ? AND status = 'delivered' ORDER BY created_at DESC")
    .all(buyerId);
  return rows.map(attachItems);
}

export function getMerchantOrders(merchantId) {
  const db = getDB();
  const rows = db
    .prepare('SELECT * FROM orders WHERE merchant_id = ? ORDER BY created_at DESC LIMIT 30')
    .all(merchantId);
  return rows.map(attachItems);
}

export function getDriverFeed(driverId) {
  const db = getDB();
  const available = db
    .prepare(
      `SELECT * FROM orders
       WHERE driver_id IS NULL AND status IN ('accepted_merchant','ready_for_pickup')
       ORDER BY created_at ASC`
    )
    .all()
    .map(attachItems);
  const mine = db
    .prepare(
      `SELECT * FROM orders
       WHERE driver_id = ? AND status IN ('ready_for_pickup','picked_up')
       ORDER BY created_at DESC`
    )
    .all(driverId)
    .map(attachItems);
  return { available, mine };
}

// ---- Mutations ----

function randomHex(len) {
  let s = '';
  while (s.length < len) s += Math.random().toString(16).slice(2);
  return s.slice(0, len);
}

export function createOrder({ buyerId, merchantId, lines, deliveryFee, gasFee, address, note }) {
  const db = getDB();
  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const total = subtotal + deliveryFee + gasFee;
  const id = randomHex(12);
  const txHash = '0x' + randomHex(40);

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO orders (id, buyer_id, merchant_id, driver_id, subtotal, delivery_fee, gas_fee, total, status, delivery_address, note, tx_hash)
       VALUES (?, ?, ?, NULL, ?, ?, ?, ?, 'paid', ?, ?, ?)`
    ).run(id, buyerId, merchantId, subtotal, deliveryFee, gasFee, total, address, note || '', txHash);
    const insItem = db.prepare('INSERT INTO order_items (order_id, name, qty, price) VALUES (?, ?, ?, ?)');
    lines.forEach((l) => insItem.run(id, l.name, l.qty, l.price));
  });
  tx();
  return getOrder(id);
}

const STATUS_RANK = {
  paid: 0,
  accepted_merchant: 1,
  ready_for_pickup: 2,
  picked_up: 3,
  delivered: 4,
};

export function advanceOrderStatus(orderId, nextStatus, { merchantId, driverId } = {}) {
  const db = getDB();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) return { ok: false, error: 'Pesanan tidak ditemukan.' };
  if (merchantId && order.merchant_id !== merchantId) return { ok: false, error: 'Bukan pesanan toko ini.' };
  if (STATUS_RANK[nextStatus] <= STATUS_RANK[order.status]) {
    return { ok: false, error: 'Status tidak valid.' };
  }
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(nextStatus, orderId);
  if (driverId) db.prepare('UPDATE orders SET driver_id = ? WHERE id = ?').run(driverId, orderId);
  return { ok: true, order: getOrder(orderId) };
}

export function driverAccept(orderId, driverId) {
  const db = getDB();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) return { ok: false, error: 'Pesanan tidak ditemukan.' };
  if (order.driver_id) return { ok: false, error: 'Pesanan sudah diambil driver lain.' };
  db.prepare("UPDATE orders SET driver_id = ?, status = 'picked_up' WHERE id = ?").run(driverId, orderId);
  return { ok: true, order: getOrder(orderId) };
}

export function driverComplete(orderId, driverId) {
  const db = getDB();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) return { ok: false, error: 'Pesanan tidak ditemukan.' };
  if (order.driver_id !== driverId) return { ok: false, error: 'Bukan pesanan Anda.' };
  const settleHash = '0x' + randomHex(40);
  db.prepare("UPDATE orders SET status = 'delivered' WHERE id = ?").run(orderId);
  return { ok: true, txHash: settleHash, order: getOrder(orderId) };
}
