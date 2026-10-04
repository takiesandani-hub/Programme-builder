const express = require('express');
const QRCode = require('qrcode');
const { readCollection, update, genId, uniqueSlug } = require('../lib/db');
const requireAuth = require('../middleware/requireAuth');
const {
  TYPES,
  TEMPLATES,
  DEFAULT_TEMPLATE,
  defaultContent,
  slugSeed,
  summarize,
  publicPath,
} = require('../lib/programme');

const router = express.Router();
router.use(requireAuth);

function findOwned(req, id) {
  const programmes = readCollection('programmes');
  const programme = programmes.find((p) => p.id === id);
  if (!programme || programme.ownerId !== req.session.userId) return null;
  return programme;
}

router.get('/', (req, res) => {
  const programmes = readCollection('programmes').filter((p) => p.ownerId === req.session.userId);
  programmes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json({ programmes: programmes.map(summarize) });
});

router.post('/', async (req, res) => {
  const { type, template } = req.body || {};
  if (!TYPES.includes(type)) {
    return res.status(400).json({ error: 'Invalid programme type.' });
  }
  const chosenTemplate = TEMPLATES[type].includes(template) ? template : DEFAULT_TEMPLATE[type];

  const now = new Date().toISOString();
  const content = defaultContent(type);

  const programme = {
    id: genId(),
    ownerId: req.session.userId,
    type,
    template: chosenTemplate,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    views: 0,
    scans: 0,
    lastViewedAt: null,
    content,
  };

  await update('programmes', (items) => {
    const existingSlugs = new Set(items.map((p) => p.slug));
    programme.slug = uniqueSlug(existingSlugs, slugSeed(type, content));
    items.push(programme);
  });

  res.status(201).json({ programme: summarize(programme), id: programme.id });
});

router.get('/:id', (req, res) => {
  const programme = findOwned(req, req.params.id);
  if (!programme) return res.status(404).json({ error: 'Programme not found.' });
  res.json({ programme: { ...programme, publicPath: publicPath(programme) } });
});

router.put('/:id', async (req, res) => {
  const existing = findOwned(req, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Programme not found.' });

  const { content, template } = req.body || {};

  await update('programmes', (items) => {
    const target = items.find((p) => p.id === existing.id);
    if (content && typeof content === 'object') {
      target.content = { ...target.content, ...content };
    }
    if (template && TEMPLATES[target.type].includes(template)) {
      target.template = template;
    }
    target.updatedAt = new Date().toISOString();
  });

  const updated = findOwned(req, req.params.id);
  res.json({ programme: { ...updated, publicPath: publicPath(updated) } });
});

router.delete('/:id', async (req, res) => {
  const existing = findOwned(req, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Programme not found.' });

  await update('programmes', (items) => {
    const idx = items.findIndex((p) => p.id === existing.id);
    if (idx !== -1) items.splice(idx, 1);
  });

  res.json({ ok: true });
});

router.post('/:id/duplicate', async (req, res) => {
  const existing = findOwned(req, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Programme not found.' });

  const now = new Date().toISOString();
  const copy = {
    ...existing,
    id: genId(),
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    views: 0,
    scans: 0,
    lastViewedAt: null,
    content: JSON.parse(JSON.stringify(existing.content)),
  };

  await update('programmes', (items) => {
    const existingSlugs = new Set(items.map((p) => p.slug));
    copy.slug = uniqueSlug(existingSlugs, slugSeed(copy.type, copy.content));
    items.push(copy);
  });

  res.status(201).json({ programme: summarize(copy) });
});

router.post('/:id/publish', async (req, res) => {
  const existing = findOwned(req, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Programme not found.' });

  await update('programmes', (items) => {
    const target = items.find((p) => p.id === existing.id);
    target.status = 'published';
    target.updatedAt = new Date().toISOString();
  });

  const updated = findOwned(req, req.params.id);
  res.json({ programme: updated });
});

router.post('/:id/unpublish', async (req, res) => {
  const existing = findOwned(req, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Programme not found.' });

  await update('programmes', (items) => {
    const target = items.find((p) => p.id === existing.id);
    target.status = 'draft';
    target.updatedAt = new Date().toISOString();
  });

  const updated = findOwned(req, req.params.id);
  res.json({ programme: updated });
});

router.get('/:id/qrcode.png', async (req, res) => {
  const existing = findOwned(req, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Programme not found.' });

  const publicUrl = `${req.protocol}://${req.get('host')}${publicPath(existing)}?src=qr`;

  try {
    const buffer = await QRCode.toBuffer(publicUrl, { width: 512, margin: 2 });
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'no-store');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Could not generate QR code.' });
  }
});

router.get('/:id/analytics', (req, res) => {
  const existing = findOwned(req, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Programme not found.' });
  res.json({
    views: existing.views || 0,
    scans: existing.scans || 0,
    lastViewedAt: existing.lastViewedAt || null,
  });
});

module.exports = router;
