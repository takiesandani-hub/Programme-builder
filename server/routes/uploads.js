const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth);

const NETLIFY_MODE = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
const UPLOADS_DIR = path.resolve(
  process.env.UPLOADS_DIR || path.join(__dirname, '..', '..', 'uploads')
);
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const EXT_BY_TYPE = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

const storage = NETLIFY_MODE
  ? multer.memoryStorage()
  : multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOADS_DIR, req.session.userId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = EXT_BY_TYPE[file.mimetype] || '.jpg';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, WEBP or GIF images are allowed.'));
    }
    cb(null, true);
  },
});

router.post('/', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No image provided.' });
    try {
      const filename = req.file.filename || `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXT_BY_TYPE[req.file.mimetype]}`;
      if (NETLIFY_MODE) {
        const { getNetlifyStore } = require('../lib/blob-store');
        const buffer = req.file.buffer;
        const data = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        const store = await getNetlifyStore('scanprogram-uploads');
        await store.set(
          `${req.session.userId}/${filename}`,
          data,
          { metadata: { contentType: req.file.mimetype } }
        );
      }
      const url = `/uploads/${req.session.userId}/${filename}`;
      res.status(201).json({ url });
    } catch (error) {
      console.error('Could not persist uploaded artwork.', error);
      res.status(500).json({ error: 'Could not save this image. Please try again.' });
    }
  });
});

module.exports = router;
