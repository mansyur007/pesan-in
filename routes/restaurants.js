const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

router.get('/', (req, res) => {
  const db = getDB();
  const { category, search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let query = `SELECT r.*, c.name as category_name, c.icon as category_icon
    FROM restaurants r LEFT JOIN categories c ON r.category_id = c.id WHERE 1=1`;
  const params = [];
  if (category && category !== 'all') { query += ' AND c.slug = ?'; params.push(category); }
  if (search) { query += ' AND (r.name LIKE ? OR r.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  query += ' ORDER BY r.rating DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  res.json(db.prepare(query).all(...params));
});

router.get('/:id', (req, res) => {
  const db = getDB();
  const r = db.prepare(`SELECT r.*, c.name as category_name, c.icon as category_icon
    FROM restaurants r LEFT JOIN categories c ON r.category_id = c.id
    WHERE r.id = ? OR r.slug = ?`).get(req.params.id, req.params.id);
  if (!r) return res.status(404).json({ error: 'Restaurant not found' });
  res.json(r);
});

router.get('/:id/menu', (req, res) => {
  const db = getDB();
  const r = db.prepare('SELECT id FROM restaurants WHERE id = ? OR slug = ?').get(req.params.id, req.params.id);
  if (!r) return res.status(404).json({ error: 'Restaurant not found' });
  const cats = db.prepare('SELECT * FROM menu_categories WHERE restaurant_id = ? ORDER BY sort_order').all(r.id);
  const items = db.prepare('SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY is_popular DESC, name').all(r.id);
  res.json(cats.map(cat => ({ ...cat, items: items.filter(i => i.menu_category_id === cat.id) })));
});

router.put('/:id/toggle', (req, res) => {
  const db = getDB();
  const r = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE restaurants SET is_open = ? WHERE id = ?').run(r.is_open ? 0 : 1, req.params.id);
  res.json({ success: true, is_open: r.is_open ? 0 : 1 });
});

module.exports = router;
