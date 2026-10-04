const fs = require('fs');
const path = require('path');
const { readCollection, update, genId } = require('./lib/db');
const { hashPassword } = require('./lib/auth');

const DATA_DIR = path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

async function seed() {
  const users = readCollection('users');
  const existingAdmin = users.find((u) => u.role === 'admin');

  if (existingAdmin) {
    console.log('Admin account already exists:', existingAdmin.email);
    return;
  }

  const email = 'admin@scanprogram.local';
  const password = 'Admin123!';

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
  console.log('  password:', password);
}

seed();
