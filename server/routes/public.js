const express = require('express');
const crypto = require('crypto');
const { readCollection, update } = require('../lib/db');
const { TYPES } = require('../lib/programme');

const router = express.Router();

function findVisible(req, type, slug) {
  const programmes = readCollection('programmes');
  const programme = programmes.find((p) => p.type === type && p.slug === slug);
  if (!programme) return null;
  if (programme.status === 'published') return programme;
  if (req.session && req.session.userId === programme.ownerId) return programme;
  return null;
}

router.get('/:type/:slug', (req, res) => {
  const { type, slug } = req.params;
  if (!TYPES.includes(type)) return res.status(404).json({ error: 'Not found.' });

  const programme = findVisible(req, type, slug);
  if (!programme) return res.status(404).json({ error: 'This programme is not available.' });

  const isOwner = req.session && req.session.userId === programme.ownerId;
  res.json({
    type: programme.type,
    template: programme.template,
    status: programme.status,
    content: programme.content,
    preview: isOwner && programme.status !== 'published',
  });
});

function cleanGuestField(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

router.post('/:type/:slug/guest-scan', async (req, res) => {
  const { type, slug } = req.params;
  if (!TYPES.includes(type)) return res.status(404).json({ error: 'Not found.' });

  const programme = readCollection('programmes').find((item) => item.type === type && item.slug === slug);
  if (!programme || programme.status !== 'published') {
    return res.status(404).json({ error: 'This programme is not available.' });
  }

  if (req.session?.userId === programme.ownerId) {
    return res.json({ ok: true, recorded: false });
  }

  const firstName = cleanGuestField(req.body?.firstName);
  const surname = cleanGuestField(req.body?.surname);
  const phone = cleanGuestField(req.body?.phone);
  const digits = phone.replace(/\D/g, '');
  if (!firstName || firstName.length > 80 || !surname || surname.length > 80) {
    return res.status(400).json({ error: 'Enter your first name and surname (up to 80 characters each).' });
  }
  if (phone.length > 30 || digits.length < 7 || digits.length > 15 || !/^\+?[0-9().\s-]+$/.test(phone)) {
    return res.status(400).json({ error: 'Enter a valid phone number, including country code if needed.' });
  }
  if (req.body?.consent !== true) {
    return res.status(400).json({ error: 'Please read and accept the privacy notice to continue.' });
  }

  const scannedAt = new Date().toISOString();
  const scanId = crypto.randomUUID();
  try {
    await update('guestScans', (items) => {
      items.push({
        id: scanId,
        programmeId: programme.id,
        programmeOwnerId: programme.ownerId,
        programmeType: programme.type,
        programmeSlug: programme.slug,
        firstName,
        surname,
        phone,
        source: 'qr',
        consentAt: scannedAt,
        scannedAt,
      });
    });
    const programmeUpdated = await update('programmes', (items) => {
      const target = items.find((item) => item.id === programme.id);
      if (!target || target.status !== 'published') return false;
      target.scans = (target.scans || 0) + 1;
      target.lastViewedAt = scannedAt;
      return true;
    });
    if (!programmeUpdated) {
      await update('guestScans', (items) => {
        const index = items.findIndex((item) => item.id === scanId);
        if (index !== -1) items.splice(index, 1);
      });
      return res.status(404).json({ error: 'This programme is no longer available.' });
    }
  } catch (error) {
    console.error('Could not save QR guest registration.', error);
    try {
      await update('guestScans', (items) => {
        const index = items.findIndex((item) => item.id === scanId);
        if (index !== -1) items.splice(index, 1);
      });
    } catch (rollbackError) {
      console.error('Could not roll back the QR guest registration.', rollbackError);
    }
    return res.status(500).json({ error: 'We could not save your details. Please try again.' });
  }

  res.status(201).json({ ok: true, recorded: true });
});

router.post('/:type/:slug/view', async (req, res) => {
  const { type, slug } = req.params;
  const source = req.body && req.body.source === 'qr' ? 'qr' : 'link';
  if (!TYPES.includes(type)) return res.status(404).json({ error: 'Not found.' });

  const programmes = readCollection('programmes');
  const programme = programmes.find((p) => p.type === type && p.slug === slug);
  if (!programme || programme.status !== 'published') {
    return res.json({ ok: true, counted: false });
  }

  const isOwner = req.session && req.session.userId === programme.ownerId;
  if (isOwner) {
    return res.json({ ok: true, counted: false });
  }

  await update('programmes', (items) => {
    const target = items.find((p) => p.id === programme.id);
    if (!target) return;
    if (source !== 'qr') target.views = (target.views || 0) + 1;
    target.lastViewedAt = new Date().toISOString();
  });

  res.json({ ok: true, counted: true });
});

module.exports = router;
