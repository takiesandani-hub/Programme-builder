const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');

const ROOT_DIR = path.join(__dirname, '..');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');

fs.mkdirSync(path.join(ROOT_DIR, 'data'), { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(
  session({
    name: 'scanprogram.sid',
    secret: process.env.SESSION_SECRET || 'scanprogram-dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
  })
);

app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/assets', express.static(path.join(ROOT_DIR, 'assets')));
app.use('/css', express.static(path.join(ROOT_DIR, 'css')));
app.use('/js', express.static(path.join(ROOT_DIR, 'js')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/programmes', require('./routes/programmes'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/public', require('./routes/public'));
app.use('/api/admin', require('./routes/admin'));

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

app.use((req, res) => {
  res.status(404).sendFile(path.join(ROOT_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ScanProgram running at http://localhost:${PORT}`);
});
