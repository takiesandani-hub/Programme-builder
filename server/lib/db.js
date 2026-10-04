const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { AsyncLocalStorage } = require('async_hooks');

const DATA_DIR = path.resolve(
  process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data')
);
const NETLIFY_MODE = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
const COLLECTIONS = ['users', 'programmes', 'guestScans'];
const requestCollections = new AsyncLocalStorage();

const writeQueues = new Map();

async function getBlobsStore() {
  if (!NETLIFY_MODE) throw new Error('Netlify Blobs is only available in a Netlify runtime.');
  return require('./blob-store').getNetlifyStore('scanprogram-data');
}

async function loadBlobCollection(name) {
  const prefix = `collections/${name}/`;
  const store = await getBlobsStore();
  const { blobs } = await store.list({ prefix });
  const items = await Promise.all(blobs.map((blob) =>
    store.get(blob.key, { type: 'json', consistency: 'eventual' })
  ));
  return { items: items.filter(Boolean) };
}

async function loadRequestCollections(req, res, next) {
  if (!NETLIFY_MODE) return next();
  try {
    const collections = new Map();
    await Promise.all(COLLECTIONS.map(async (name) => {
      collections.set(name, await loadBlobCollection(name));
    }));
    requestCollections.run(collections, () => next());
  } catch (error) {
    console.error('Could not load application data from Netlify Blobs.', error);
    res.status(503).json({ error: 'Application data is temporarily unavailable. Please try again.' });
  }
}

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
  if (NETLIFY_MODE) {
    const collections = requestCollections.getStore();
    if (!collections?.has(name)) {
      throw new Error(`Collection "${name}" was read outside a Netlify request context.`);
    }
    return collections.get(name).items;
  }
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
    if (NETLIFY_MODE) {
      const collections = requestCollections.getStore();
      if (!collections?.has(name)) {
        throw new Error(`Collection "${name}" was updated outside a Netlify request context.`);
      }
      const loaded = await loadBlobCollection(name);
      const store = await getBlobsStore();
      const previous = new Map(loaded.items.map((item) => [item.id, item]));
      const items = loaded.items.map((item) => JSON.parse(JSON.stringify(item)));
      const result = await mutator(items);
      const next = new Map(items.map((item) => [item.id, item]));
      const writes = [];
      for (const [id, item] of next) {
        if (!previous.has(id) || JSON.stringify(previous.get(id)) !== JSON.stringify(item)) {
          writes.push(store.setJSON(`collections/${name}/${encodeURIComponent(id)}`, item));
        }
      }
      for (const id of previous.keys()) {
        if (!next.has(id)) writes.push(store.delete(`collections/${name}/${encodeURIComponent(id)}`));
      }
      await Promise.all(writes);
      collections.set(name, { items });
      return result;
    }
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

module.exports = {
  COLLECTIONS,
  DATA_DIR,
  getBlobsStore,
  loadRequestCollections,
  readCollection,
  slugify,
  uniqueSlug,
  update,
  genId,
};
