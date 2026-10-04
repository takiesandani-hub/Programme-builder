const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

const writeQueues = new Map();

function queueWrite(file, task) {
  const prev = writeQueues.get(file) || Promise.resolve();
  const next = prev.then(task, task);
  writeQueues.set(file, next.catch(() => {}));
  return next;
}

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readCollection(name) {
  const file = filePath(name);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf8').trim();
  if (!raw) return [];
  return JSON.parse(raw);
}

function writeCollectionSync(name, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), 'utf8');
}

function update(name, mutator) {
  return queueWrite(name, async () => {
    const items = readCollection(name);
    const result = await mutator(items);
    writeCollectionSync(name, items);
    return result;
  });
}

function genId() {
  return crypto.randomBytes(12).toString('hex');
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'untitled';
}

function uniqueSlug(existingSlugs, base) {
  const baseSlug = slugify(base);
  let candidate = `${baseSlug}-${crypto.randomBytes(2).toString('hex')}`;
  while (existingSlugs.has(candidate)) {
    candidate = `${baseSlug}-${crypto.randomBytes(2).toString('hex')}`;
  }
  return candidate;
}

module.exports = { readCollection, update, genId, slugify, uniqueSlug, DATA_DIR };
