const path = require('path');
const fs = require('fs');
require('express-async-errors');
const express = require('express');
const session = require('express-session');
const { loadRequestCollections } = require('./lib/db');

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT_DIR, 'data'));
const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || path.join(ROOT_DIR, 'uploads'));
const isNetlify = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
const isProduction = process.env.NODE_ENV === 'production'
  || (isNetlify && process.env.CONTEXT !== 'dev' && process.env.NETLIFY_DEV !== 'true');

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in production.');
}

if (!isNetlify) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3000;

if (isProduction) app.set('trust proxy', 1);

app.use(express.json({ limit: '1mb' }));
app.use(
  session({
    name: 'scanprogram.sid',
    secret: process.env.SESSION_SECRET || 'scanprogram-local-development-secret',
    ...(isNetlify ? { store: new (require('./lib/netlify-session-store'))() } : {}),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: isProduction,
    },
  })
);

app.get('/healthz', (req, res) => res.status(200).json({ status: 'ok' }));
if (!isNetlify) app.use('/uploads', express.static(UPLOADS_DIR));
else {
  app.get('/uploads/:ownerId/:filename', async (req, res) => {
    try {
      const { getNetlifyStore } = require('./lib/blob-store');
      const store = await getNetlifyStore('scanprogram-uploads');
      const blob = await store.getWithMetadata(`${req.params.ownerId}/${req.params.filename}`, {
        type: 'arrayBuffer',
      });
      if (!blob) return res.status(404).end();
      res.set('Content-Type', blob.metadata.contentType || 'application/octet-stream');
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(Buffer.from(blob.data));
    } catch (error) {
      console.error('Could not retrieve uploaded artwork.', error);
      res.status(503).json({ error: 'Uploaded artwork is temporarily unavailable.' });
    }
  });
}
app.use('/assets', express.static(path.join(ROOT_DIR, 'assets')));
app.use('/css', express.static(path.join(ROOT_DIR, 'css')));
app.use('/js', express.static(path.join(ROOT_DIR, 'js')));

app.use('/api', loadRequestCollections);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/programmes', require('./routes/programmes'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/public', require('./routes/public'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/setup', require('./routes/setup'));

const TYPE_PAGE = { w: 'w.html', f: 'f.html', m: 'm.html', c: 'c.html' };
Object.keys(TYPE_PAGE).forEach((prefix) => {
  app.get(`/${prefix}/:slug`, (req, res) => {
    res.sendFile(path.join(ROOT_DIR, TYPE_PAGE[prefix]));
  });
});

// Only serves *.html files that live directly in the project root (no
// subdirectories) -- this intentionally excludes server/, data/, uploads/
// and node_modules/ from being served as static files.
app.get(/^\/[a-zA-Z0-9._-]*$/, (req, res, next) => {
  const requested = req.path === '/' ? 'index.html' : req.path.slice(1);
  const fileName = requested.endsWith('.html') ? requested : `${requested}.html`;
  const filePath = path.join(ROOT_DIR, fileName);
  if (path.dirname(filePath) !== ROOT_DIR) return next();
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return next();
    res.sendFile(filePath);
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error('Unhandled application request error.', error);
  res.status(500).json({ error: 'The request could not be completed. Please try again.' });
});

app.use((req, res) => {
  if (isNetlify) return res.status(404).json({ error: 'Not found.' });
  res.status(404).sendFile(path.join(ROOT_DIR, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ScanProgram listening on port ${PORT}`);
  });
}

module.exports = app;
