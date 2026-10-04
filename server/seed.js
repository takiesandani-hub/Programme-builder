const fs = require('fs');
const { readCollection, update, genId, DATA_DIR } = require('./lib/db');
const { hashPassword } = require('./lib/auth');

fs.mkdirSync(DATA_DIR, { recursive: true });

async function seed() {
  const users = readCollection('users');
  const existingAdmin = users.find((u) => u.role === 'admin');

  if (existingAdmin) {
    console.log('Admin account already exists:', existingAdmin.email);
    return;
  }

  const name = (process.env.ADMIN_NAME || '').trim();
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!name || !email || password.length < 12) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 12 characters.');
  }

  await update('users', (items) => {
    items.push({
      id: genId(),
      name: 'ScanProgram Admin',
      email,
      passwordHash: hashPassword(password),
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
  });

  console.log('Admin account created:');
  console.log('  email:   ', email);
}

seed().catch((error) => {
  console.error('Could not create admin account:', error.message);
  process.exitCode = 1;
});
