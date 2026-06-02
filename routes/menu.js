const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

router.get('/restaurant/:restaurantId', (req, res) => {
  const db = getDB();
  res.json(db.prepare('SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY is_popular DESC').all(req.params.restaurantId));
});

router.post('/', (req, res) => {
  const db = getDB();
  const { restaurant_id, menu_category_id, name, description, price } = req.body;
  if (!restaurant_id || !name || !price) return res.status(400).json({ error: 'Missing fields' });
  const r = db.prepare('INSERT INTO menu_items (restaurant_id, menu_category_id, name, description, price, is_available) VALUES (?, ?, ?, ?, ?, 1)').run(restaurant_id, menu_category_id || null, name, description || '', price);
  res.json({ id: r.lastInsertRowid, success: true });
});

router.put('/:id', (req, res) => {
  const db = getDB();
  const { name, description, price, is_available } = req.body;
  db.prepare('UPDATE menu_items SET name=?, description=?, price=?, is_available=? WHERE id=?').run(name, description, price, is_available, req.params.id);
  res.json({ success: true });
});

router.put('/:id/toggle', (req, res) => {
  const db = getDB();
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE menu_items SET is_available = ? WHERE id = ?').run(item.is_available ? 0 : 1, req.params.id);
  res.json({ success: true, is_available: item.is_available ? 0 : 1 });
});

router.delete('/:id', (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
