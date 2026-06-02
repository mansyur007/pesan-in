const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db');
const { requireAuth, SECRET } = require('../middleware/auth');

const AVATARS = ['😊','😎','🧑','👩','👨','🧔','👱','🙂','😄','🤩','🥳','😇'];

router.post('/register', (req, res) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
  if (password.length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter' });
  const db = getDB();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(400).json({ error: 'Email sudah terdaftar' });
  const hash = bcrypt.hashSync(password, 10);
  const userRole = ['customer', 'driver'].includes(role) ? role : 'customer';
  const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const { lastInsertRowid } = db.prepare(
    'INSERT INTO users (name, email, phone, password_hash, role, avatar) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, email.toLowerCase(), phone || '', hash, userRole, avatar);
  db.prepare('INSERT INTO wallets (user_id, idr_balance) VALUES (?, 0)').run(lastInsertRowid);
  if (userRole === 'driver') {
    db.prepare('INSERT INTO driver_profiles (user_id) VALUES (?)').run(lastInsertRowid);
  }
  const token = jwt.sign({ id: lastInsertRowid, email: email.toLowerCase(), role: userRole }, SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: lastInsertRowid, name, email: email.toLowerCase(), role: userRole, avatar } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib diisi' });
  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar } });
});

router.get('/me', requireAuth, (req, res) => {
  const db = getDB();
  const user = db.prepare('SELECT id, name, email, phone, address, role, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
  res.json(user);
});

router.put('/profile', requireAuth, (req, res) => {
  const { name, phone, address, avatar } = req.body;
  const db = getDB();
  db.prepare('UPDATE users SET name=COALESCE(?,name), phone=COALESCE(?,phone), address=COALESCE(?,address), avatar=COALESCE(?,avatar) WHERE id=?')
    .run(name || null, phone || null, address || null, avatar || null, req.user.id);
  res.json({ success: true });
});

router.put('/password', requireAuth, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password || new_password.length < 6) return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
  const db = getDB();
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(current_password, user.password_hash)) return res.status(401).json({ error: 'Password saat ini salah' });
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(new_password, 10), req.user.id);
  res.json({ success: true });
});

router.get('/users', (req, res) => {
  const db = getDB();
  const users = db.prepare('SELECT id, name, email, phone, role, avatar, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

module.exports = router;
