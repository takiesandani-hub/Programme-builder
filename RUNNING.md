# Run Atelier and the programme service

## Local development

From the project folder, start the Node/Express application:

```powershell
npm install
npm run dev
```

Then open <http://localhost:3000>. The homepage leads to real sign-up and login. Authenticated users can create wedding, memorial, restaurant and meeting/conference programmes, upload artwork, edit and publish them, and get a QR code and share link. The backend uses JSON files under `data/` for account and programme persistence; there is no SQL database. User-uploaded images are stored under `uploads/`.

For a production Node host, set a long random `SESSION_SECRET`, enable HTTPS, and use persistent storage for `data/` and `uploads/`. The included Express session store is for local/small deployments; choose a durable session store before scaling across multiple instances. Back up the JSON data and uploads together.

## Hosting the full app on Netlify

The app now has a Netlify Functions adapter. Netlify serves the frontend pages and runs the Express API as a serverless function. JSON records, login sessions and uploaded artwork are stored in Netlify Blobs; no SQL database or persistent disk is needed. Use the GitHub repository `takiesandani-hub/programme-builder`.

1. In Netlify, choose **Add new site > Import an existing project**, connect the GitHub account that can access the repository, and select `programme-builder` on branch `main`.
2. Netlify reads `netlify.toml`. Confirm the build command is `npm run build:netlify`, publish directory is `dist`, and functions directory is `netlify/functions`.
3. In the site's environment variables, set:
   - `NODE_ENV` to `production`.
   - `SESSION_SECRET` to a long random secret.
   - `NETLIFY_BLOBS_SITE_ID` to the Site ID shown under **Project configuration > General > Project details**.
   - `NETLIFY_BLOBS_TOKEN` to a Netlify personal access token with access to this site. Create it from your Netlify user settings under **Applications > Personal access tokens**. Keep it server-side and do not commit it.

   The Blobs adapter uses the Netlify API with strong consistency. The site ID and token are required because Lambda-compatible functions do not expose the uncached Blobs endpoint needed for strong reads. `NETLIFY_BLOBS_API_URL` is optional and defaults to `https://api.netlify.com`.
4. Deploy the site. Netlify Blobs is used automatically by the function at runtime; its site-wide stores persist across deploys. The `/healthz` check verifies the function can access persistent storage. Test `https://YOUR-SITE.netlify.app/healthz` and confirm it returns `{"status":"ok"}`.
5. Create the initial platform administrator once. Set a temporary `ADMIN_SETUP_TOKEN` in Netlify environment variables and redeploy. In PowerShell, replace the URL and enter the token, name, email and a unique password (minimum 12 characters) when prompted:

   ```powershell
   $site = "https://YOUR-SITE.netlify.app"
   $token = Read-Host "Temporary admin setup token"
   $password = Read-Host "New admin password"
   $body = @{
     token = $token
     name = "Your name"
     email = "you@example.com"
     password = $password
   } | ConvertTo-Json
   Invoke-RestMethod -Method Post -Uri "$site/api/setup/admin" -ContentType "application/json" -Body $body
   ```

6. Remove `ADMIN_SETUP_TOKEN` from Netlify and redeploy immediately. The setup endpoint is disabled when this variable is absent. Then test sign-up/login, create and publish a programme, open its QR page, and check guest registrations in the admin dashboard.

The frontend is copied into `dist/` by the build script. The Express API, dynamic programme pages and uploaded image URLs are routed through the Netlify function in `netlify.toml`. Image responses are returned as binary data so uploaded artwork and generated QR codes retain their original bytes. Netlify Functions have request-size and execution limits; uploads are therefore limited to 4 MB.

**Storage limitation:** Netlify Blobs is a key/value store, not a relational database. The configured API path provides strong reads, so recently written sessions, reset tokens and programmes can be read by the next request. Simultaneous edits to the same record can still overwrite each other (last-write-wins). Treat this setup as appropriate for a low-volume pilot; for important production guest records or concurrent users, use a transactional database or a storage service with conditional writes and backups.

Pushes to the connected branch can trigger future deployments. Protect guest contact information and restrict site administrator access.

## Hosting the full app on Render

Alternatively, host the Node application on a Render web service. Set **Build Command** to `npm install`, **Start Command** to `npm start`, and attach persistent storage. Configure `NODE_ENV=production`, `SESSION_SECRET`, `DATA_DIR`, and `UPLOADS_DIR`. The Express app uses JSON files and uploaded files on that disk; use a paid service with persistent disk for real records. Create the admin with temporary `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` environment variables (password minimum 12 characters) and run `npm run seed:admin` in the service shell once. Remove the temporary variables afterward. The session store is in memory on Render, so keep one service instance and expect users to sign in again after restarts.

## Hosting and GitHub Pages

The authenticated workflow requires this Express server and cannot run on GitHub Pages alone. GitHub Pages serves static files only; it cannot run the auth APIs, protect programme ownership, persist server-side programme data, or generate account-bound QR codes.

Host the Node application on a service that runs `npm start` (or `npm run dev` for development) and direct the production domain to that service for real accounts and publishing. Do not use the browser-local studio as a substitute for authenticated storage.

The standalone editor is available at `/atelier.html`. It uses relative local asset paths and works as a static Pages showcase, including its existing canvas editing, browser-local projects, backup/restore, image placement and PNG export. Its projects remain in that browser's `localStorage`; they are not connected to, or secured by, the authenticated server workflow. On GitHub Pages project sites, open the relative `atelier.html` page directly. The server-backed landing/auth flow intentionally uses root paths and is intended for the Express-hosted application.

## Data, privacy and publishing

On a local or Render Node server, accounts, programmes, and guest registrations persist as JSON files on the configured host storage. On Netlify, those records, sessions, and uploaded images are stored in Netlify Blobs instead. Programme editing and image uploads require a signed-in session; private drafts are only previewable by their owner. Publishing makes a public programme page available to anyone with its link. The QR code points to that public page. Use **Unpublish** to return a published programme to a private draft.

The static Atelier page is intentionally separate: its local projects do not upload, publish or share automatically. Server uploads accept JPEG, PNG, WEBP and GIF files up to 4 MB.

When a guest opens a programme using its QR code, the page asks for first name, surname, phone number and explicit consent before showing the programme. A successful check-in increments that programme's scan count and is recorded separately from client programme data (in `data/guestScans.json` on a local/Render server, or in Netlify Blobs on Netlify). The record links the event and its owning client account to the guest. Only a signed-in platform administrator can read or delete guest registrations through the Admin Dashboard; programme owners and other clients do not have an API or dashboard view of guest names or phone numbers. QR visits through this form count as scans; ordinary share-link visits count as views.

Guest contact information is personal data: explain the collection to guests (the check-in form does), restrict admin accounts, serve the production site only over HTTPS, protect the host and storage backups, and delete registrations when no longer needed. Admins can remove individual guest registrations in the dashboard; removing the contact record does not reduce the programme's aggregate scan counter. Configure and document a retention policy appropriate to your local privacy requirements before production use.
