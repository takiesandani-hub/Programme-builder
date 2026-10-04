# Run Atelier and the programme service

## Local development

From the project folder, start the Node/Express application:

```powershell
npm install
npm run dev
```

Then open <http://localhost:3000>. The homepage leads to real sign-up and login. Authenticated users can create wedding, memorial, restaurant and meeting/conference programmes, upload artwork, edit and publish them, and get a QR code and share link. The backend uses JSON files under `data/` for account and programme persistence; there is no SQL database. User-uploaded images are stored under `uploads/`.

For a production Node host, set a long random `SESSION_SECRET`, enable HTTPS, and use persistent storage for `data/` and `uploads/`. The included Express session store is for local/small deployments; choose a durable session store before scaling across multiple instances. Back up the JSON data and uploads together.

## Hosting and GitHub Pages

The authenticated workflow requires this Express server and cannot run on GitHub Pages alone. GitHub Pages serves static files only; it cannot run the auth APIs, protect programme ownership, persist server-side programme data, or generate account-bound QR codes.

Host the Node application on a service that runs `npm start` (or `npm run dev` for development) and direct the production domain to that service for real accounts and publishing. Do not use the browser-local studio as a substitute for authenticated storage.

The standalone editor is available at `/atelier.html`. It uses relative local asset paths and works as a static Pages showcase, including its existing canvas editing, browser-local projects, backup/restore, image placement and PNG export. Its projects remain in that browser's `localStorage`; they are not connected to, or secured by, the authenticated server workflow. On GitHub Pages project sites, open the relative `atelier.html` page directly. The server-backed landing/auth flow intentionally uses root paths and is intended for the Express-hosted application.

## Data, privacy and publishing

Accounts and programmes persist as JSON files on the Node host. Programme editing and image uploads require a signed-in session; private drafts are only previewable by their owner. Publishing makes a public programme page available to anyone with its link. The QR code points to that public page. Use **Unpublish** to return a published programme to a private draft.

The static Atelier page is intentionally separate: its local projects do not upload, publish or share automatically. Use a small, reasonable image size for uploaded server artwork (maximum 8 MB; JPEG, PNG, WEBP and GIF are supported).

When a guest opens a programme using its QR code, the page asks for first name, surname, phone number and explicit consent before showing the programme. A successful check-in increments that programme's scan count and is recorded in `data/guestScans.json`, separately from client programme data. The record links the event and its owning client account to the guest. Only a signed-in platform administrator can read or delete guest registrations through the Admin Dashboard; programme owners and other clients do not have an API or dashboard view of guest names or phone numbers. QR visits through this form count as scans; ordinary share-link visits count as views.

Guest contact information is personal data: explain the collection to guests (the check-in form does), restrict admin accounts, serve the production site only over HTTPS, protect the host and backups containing `data/guestScans.json`, and delete registrations when no longer needed. Admins can remove individual guest registrations in the dashboard; removing the contact record does not reduce the programme's aggregate scan counter. This JSON-file setup stores records on the application host and does not provide automatic retention or encrypted-at-rest storage; configure and document a retention policy appropriate to your local privacy requirements before production use.
