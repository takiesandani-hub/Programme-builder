const { readCollection } = require('../lib/db');

module.exports = function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not signed in' });
  }
  const users = readCollection('users');
  const user = users.find((u) => u.id === req.session.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
