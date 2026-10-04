const express = require('express');
const crypto = require('crypto');
const { readCollection, update, genId } = require('../lib/db');
const { hashPassword, comparePassword, publicUser } = require('../lib/auth');

const router = express.Router();

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !isValidEmail(email) || !password || password.length < 6) {
    return res.status(400).json({ error: 'Please provide a name, valid email and a password of at least 6 characters.' });
  }
  const normalizedEmail = email.toLowerCase().trim();

  const users = readCollection('users');
  if (users.some((u) => u.email === normalizedEmail)) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const user = {
    id: genId(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    role: 'customer',
    createdAt: new Date().toISOString(),
  };

  await update('users', (items) => {
    items.push(user);
  });

  req.session.userId = user.id;
  res.status(201).json({ user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!isValidEmail(email) || !password) {
    return res.status(400).json({ error: 'Please provide an email and password.' });
  }
  const normalizedEmail = email.toLowerCase().trim();
  const users = readCollection('users');
  const user = users.find((u) => u.email === normalizedEmail);

  if (!user || !comparePassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  req.session.userId = user.id;
  res.json({ user: publicUser(user) });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('scanprogram.sid');
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not signed in' });
  }
  const users = readCollection('users');
  const user = users.find((u) => u.id === req.session.userId);
  if (!user) return res.status(401).json({ error: 'Not signed in' });
  res.json({ user: publicUser(user) });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body || {};
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  const normalizedEmail = email.toLowerCase().trim();
  const users = readCollection('users');
  const user = users.find((u) => u.email === normalizedEmail);

  if (!user) {
    return res.json({ ok: true });
  }

  const token = crypto.randomBytes(24).toString('hex');
  const expiry = Date.now() + 60 * 60 * 1000;

  await update('users', (items) => {
    const target = items.find((u) => u.id === user.id);
    target.resetToken = token;
    target.resetTokenExpiry = expiry;
  });

  const resetLink = `${req.protocol}://${req.get('host')}/reset-password.html?token=${token}`;
  res.json({ ok: true, resetLink });
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password || password.length < 6) {
    return res.status(400).json({ error: 'Please provide a valid token and a password of at least 6 characters.' });
  }

  const users = readCollection('users');
  const user = users.find((u) => u.resetToken === token && u.resetTokenExpiry > Date.now());
  if (!user) {
    return res.status(400).json({ error: 'This reset link is invalid or has expired.' });
  }

  await update('users', (items) => {
    const target = items.find((u) => u.id === user.id);
    target.passwordHash = hashPassword(password);
    delete target.resetToken;
    delete target.resetTokenExpiry;
  });

  res.json({ ok: true });
});

module.exports = router;
