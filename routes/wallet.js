const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, (req, res) => {
  const db = getDB();
  const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(req.user.id);
  const transactions = db.prepare('SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
  res.json({ wallet: wallet || { idr_balance: 0, gfc_balance: 0, usdt_balance: 0, btc_balance: 0 }, transactions });
});

router.post('/topup', requireAuth, (req, res) => {
  const { amount, currency = 'IDR', method = 'Transfer Bank' } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Jumlah tidak valid' });
  const db = getDB();
  const colMap = { IDR: 'idr_balance', GFC: 'gfc_balance', USDT: 'usdt_balance', BTC: 'btc_balance' };
  const col = colMap[currency];
  if (!col) return res.status(400).json({ error: 'Mata uang tidak valid' });
  if (currency === 'IDR' && amount < 10000) return res.status(400).json({ error: 'Minimum top up IDR Rp 10.000' });
  db.prepare(`UPDATE wallets SET ${col} = ${col} + ? WHERE user_id = ?`).run(amount, req.user.id);
  db.prepare('INSERT INTO wallet_transactions (user_id, type, currency, amount, description) VALUES (?, ?, ?, ?, ?)')
    .run(req.user.id, 'topup', currency, amount, `Top Up ${currency} via ${method}`);
  const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(req.user.id);
  res.json({ success: true, wallet });
});

router.post('/transfer', requireAuth, (req, res) => {
  const { to_email, amount, currency = 'IDR' } = req.body;
  if (!to_email || !amount || amount <= 0) return res.status(400).json({ error: 'Lengkapi data transfer' });
  const db = getDB();
  const toUser = db.prepare('SELECT id FROM users WHERE email = ?').get(to_email.toLowerCase());
  if (!toUser) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
  if (toUser.id === req.user.id) return res.status(400).json({ error: 'Tidak bisa transfer ke diri sendiri' });
  const colMap = { IDR: 'idr_balance', GFC: 'gfc_balance', USDT: 'usdt_balance', BTC: 'btc_balance' };
  const col = colMap[currency];
  if (!col) return res.status(400).json({ error: 'Mata uang tidak valid' });
  const fromWallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(req.user.id);
  if (!fromWallet || fromWallet[col] < amount) return res.status(400).json({ error: 'Saldo tidak cukup' });
  const doTransfer = db.transaction(() => {
    db.prepare(`UPDATE wallets SET ${col} = ${col} - ? WHERE user_id = ?`).run(amount, req.user.id);
    db.prepare(`UPDATE wallets SET ${col} = ${col} + ? WHERE user_id = ?`).run(amount, toUser.id);
    db.prepare('INSERT INTO wallet_transactions (user_id, type, currency, amount, description) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, 'transfer_out', currency, amount, `Transfer ke ${to_email}`);
    db.prepare('INSERT INTO wallet_transactions (user_id, type, currency, amount, description) VALUES (?, ?, ?, ?, ?)')
      .run(toUser.id, 'transfer_in', currency, amount, `Transfer dari ${req.user.email}`);
  });
  doTransfer();
  res.json({ success: true });
});

module.exports = router;
