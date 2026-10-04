const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class LocalBlobStore {
  constructor(root) {
    this.root = path.resolve(root);
  }

  filePath(key) {
    const file = path.resolve(this.root, key);
    if (!file.startsWith(`${this.root}${path.sep}`)) {
      throw new Error('Invalid local blob key.');
    }
    return file;
  }

  async list({ prefix = '' } = {}) {
    const blobs = [];
    const visit = (directory) => {
      if (!fs.existsSync(directory)) return;
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const itemPath = path.join(directory, entry.name);
        if (entry.isDirectory()) visit(itemPath);
        else if (!entry.name.endsWith('.metadata.json')) {
          blobs.push({ key: path.relative(this.root, itemPath).split(path.sep).join('/') });
        }
      }
    };
    visit(this.root);
    return { blobs: blobs.filter((blob) => blob.key.startsWith(prefix)), directories: [] };
  }

  async get(key, { type = 'text' } = {}) {
    const file = this.filePath(key);
    if (!fs.existsSync(file)) return null;
    const data = fs.readFileSync(file);
    if (type === 'json') return JSON.parse(data.toString('utf8'));
    if (type === 'arrayBuffer') return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    if (type === 'blob') return new Blob([data]);
    return data.toString('utf8');
  }

  async getWithMetadata(key, { type = 'text' } = {}) {
    const file = this.filePath(key);
    if (!fs.existsSync(file)) return null;
    const bytes = fs.readFileSync(file);
    const metadataFile = `${file}.metadata.json`;
    const metadata = fs.existsSync(metadataFile)
      ? JSON.parse(fs.readFileSync(metadataFile, 'utf8'))
      : {};
    const data = type === 'arrayBuffer'
      ? bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
      : type === 'json'
        ? JSON.parse(bytes.toString('utf8'))
        : bytes.toString('utf8');
    return {
      data,
      etag: crypto.createHash('sha256').update(bytes).digest('hex'),
      metadata,
    };
  }

  async setJSON(key, value, options) {
    await this.set(key, JSON.stringify(value), options);
  }

  async set(key, value, { metadata = {} } = {}) {
    const file = this.filePath(key);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const data = typeof value === 'string'
      ? Buffer.from(value)
      : value instanceof ArrayBuffer
        ? Buffer.from(value)
        : Buffer.from(await value.arrayBuffer());
    fs.writeFileSync(file, data);
    fs.writeFileSync(`${file}.metadata.json`, JSON.stringify(metadata));
  }

  async delete(key) {
    const file = this.filePath(key);
    for (const target of [file, `${file}.metadata.json`]) {
      if (fs.existsSync(target)) fs.unlinkSync(target);
    }
  }
}

const localStores = new Map();
let netlifyBlobsModule;

async function getNetlifyStore(name) {
  if (process.env.NETLIFY_BLOBS_LOCAL_DIR) {
    if (!localStores.has(name)) {
      localStores.set(
        name,
        new LocalBlobStore(path.join(process.env.NETLIFY_BLOBS_LOCAL_DIR, name))
      );
    }
    return localStores.get(name);
  }
  netlifyBlobsModule ||= import('@netlify/blobs');
  const { getStore } = await netlifyBlobsModule;
  return getStore(name, { consistency: 'eventual' });
}

module.exports = { getNetlifyStore };
