const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'gofood-2024-secret';

function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Login diperlukan' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token tidak valid atau kadaluarsa' });
  }
}

function optionalAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (token) {
    try { req.user = jwt.verify(token, SECRET); } catch {}
  }
  next();
}

module.exports = { requireAuth, optionalAuth, SECRET };
