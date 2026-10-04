const express = require('express');
const { readCollection, update } = require('../lib/db');
const requireAdmin = require('../middleware/requireAdmin');
const { publicUser } = require('../lib/auth');
const { summarize } = require('../lib/programme');

const router = express.Router();
router.use(requireAdmin);

router.get('/stats', (req, res) => {
  const users = readCollection('users');
  const programmes = readCollection('programmes');

  const byType = { wedding: 0, funeral: 0, restaurant: 0, meeting: 0 };
  let published = 0;
  let totalViews = 0;

  programmes.forEach((p) => {
    byType[p.type] = (byType[p.type] || 0) + 1;
    if (p.status === 'published') published += 1;
    totalViews += (p.views || 0) + (p.scans || 0);
  });

  res.json({
    totalUsers: users.length,
    totalProgrammes: programmes.length,
    wedding: byType.wedding,
    funeral: byType.funeral,
    restaurant: byType.restaurant,
    meeting: byType.meeting,
    published,
    totalViews,
  });
});

router.get('/users', (req, res) => {
  const users = readCollection('users').map(publicUser);
  res.json({ users });
});

router.get('/guest-scans', (req, res) => {
  const programmes = readCollection('programmes');
  const users = readCollection('users');
  const programmeById = new Map(programmes.map((programme) => [programme.id, programme]));
  const userById = new Map(users.map((user) => [user.id, user]));
  const guestScans = readCollection('guestScans')
    .map((scan) => {
      const programme = programmeById.get(scan.programmeId);
      const owner = userById.get(scan.programmeOwnerId);
      return {
        id: scan.id,
        scannedAt: scan.scannedAt,
        firstName: scan.firstName,
        surname: scan.surname,
        phone: scan.phone,
        source: scan.source,
        eventTitle: programme ? summarize(programme).title : 'Deleted programme',
        eventType: scan.programmeType,
        clientName: owner ? owner.name : 'Deleted client',
        clientEmail: owner ? owner.email : '',
      };
    })
    .sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt));
  res.json({ guestScans });
});

router.delete('/guest-scans/:id', async (req, res) => {
  let deleted = false;
  await update('guestScans', (items) => {
    const index = items.findIndex((scan) => scan.id === req.params.id);
    if (index !== -1) {
      items.splice(index, 1);
      deleted = true;
    }
  });
  if (!deleted) return res.status(404).json({ error: 'Guest registration not found.' });

  res.json({ ok: true });
});

router.get('/programmes', (req, res) => {
  const users = readCollection('users');
  const programmes = readCollection('programmes').map((p) => {
    const owner = users.find((u) => u.id === p.ownerId);
    return { ...summarize(p), ownerName: owner ? owner.name : 'Unknown', ownerEmail: owner ? owner.email : '' };
  });
  res.json({ programmes });
});

router.post('/programmes/:id/disable', async (req, res) => {
  await update('programmes', (items) => {
    const target = items.find((p) => p.id === req.params.id);
    if (target) target.status = 'disabled';
  });
  res.json({ ok: true });
});

router.post('/programmes/:id/enable', async (req, res) => {
  await update('programmes', (items) => {
    const target = items.find((p) => p.id === req.params.id);
    if (target) target.status = 'draft';
  });
  res.json({ ok: true });
});

router.delete('/programmes/:id', async (req, res) => {
  await update('programmes', (items) => {
    const idx = items.findIndex((p) => p.id === req.params.id);
    if (idx !== -1) items.splice(idx, 1);
  });
  res.json({ ok: true });
});

module.exports = router;
