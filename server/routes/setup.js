const express = require('express');
const crypto = require('crypto');
const { readCollection, update, genId } = require('../lib/db');
const { hashPassword, publicUser } = require('../lib/auth');

const router = express.Router();

router.post('/admin', async (req, res) => {
  const expectedToken = process.env.ADMIN_SETUP_TOKEN || '';
  const suppliedToken = typeof req.body?.token === 'string' ? req.body.token : '';
  const expected = Buffer.from(expectedToken);
  const supplied = Buffer.from(suppliedToken);
  if (!expected.length || expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
    return res.status(404).json({ error: 'Not found.' });
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12) {
    return res.status(400).json({ error: 'Provide a name, valid email and a password of at least 12 characters.' });
  }
  if (readCollection('users').some((user) => user.role === 'admin')) {
    return res.status(409).json({ error: 'A platform administrator already exists. Remove ADMIN_SETUP_TOKEN.' });
  }
  if (readCollection('users').some((user) => user.email === email)) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const user = {
    id: genId(),
    name,
    email,
    passwordHash: hashPassword(password),
    role: 'admin',
    createdAt: new Date().toISOString(),
  };
  try {
    const created = await update('users', (users) => {
      if (users.some((existing) => existing.role === 'admin' || existing.email === email)) {
        return false;
      }
      users.push(user);
      return true;
    });
    if (!created) return res.status(409).json({ error: 'An administrator account was created already.' });
    req.session.userId = user.id;
    res.status(201).json({ user: publicUser(user), message: 'Remove ADMIN_SETUP_TOKEN from the site environment now.' });
  } catch (error) {
    console.error('Could not create the initial platform administrator.', error);
    res.status(500).json({ error: 'Could not create the initial administrator. Please try again.' });
  }
});

module.exports = router;
