import bcrypt from 'bcryptjs';
import { getDB } from './index';

const PUBLIC_COLS = 'id, full_name, email, phone, role, avatar, address, idr_balance, matic_balance';

export function getUserById(id) {
  const db = getDB();
  return db.prepare(`SELECT ${PUBLIC_COLS} FROM users WHERE id = ?`).get(id) || null;
}

export function verifyLogin(email, password) {
  const db = getDB();
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim().toLowerCase());
  if (!row) return null;
  if (!bcrypt.compareSync(password, row.password_hash)) return null;
  const { password_hash, ...safe } = row;
  return safe;
}

const AVATARS = { buyer: '🙂', merchant: '🍔', driver: '🏍️' };

export function createUser({ fullName, email, phone, password, role }) {
  const db = getDB();
  const normalized = String(email).trim().toLowerCase();
  const exists = db.prepare('SELECT 1 FROM users WHERE email = ?').get(normalized);
  if (exists) return { ok: false, error: 'Email sudah terdaftar.' };

  const id = 'u_' + Math.random().toString(16).slice(2, 12);
  const hash = bcrypt.hashSync(password, 10);
  const startBalance = role === 'buyer' ? 50000 : 0;
  db.prepare(
    `INSERT INTO users (id, full_name, email, phone, password_hash, role, avatar, idr_balance, matic_balance)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`
  ).run(id, fullName, normalized, phone || '', hash, role, AVATARS[role] || '🙂', startBalance);
  return { ok: true, user: getUserById(id) };
}
