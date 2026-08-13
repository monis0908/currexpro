# CurrExPro — Currency Exchange Management System

A full-stack business application for managing currency buy/sell deals,
customers, bank/cash accounts, exchange rates, reports, and staff access.

## Stack

- **Frontend:** React + Vite, Tailwind CSS, React Router, React Hook Form, Recharts, Framer Motion
- **Backend:** Node.js + Express (admin-only operations)
- **Database / Auth / Storage:** Firebase Firestore, Firebase Authentication, Firebase Storage

## Architecture: how data flows

This app follows standard Firebase practice rather than routing everything
through a custom API:

- **Day-to-day data** (customers, transactions, currency rates, bank
  accounts, activity logs, settings) is read and written **directly from
  the frontend to Firestore** via the client SDK, protected by
  `firestore.rules`. This is faster, works offline-first, and is how
  Firebase apps are typically built.
- **Privileged operations that require the Firebase Admin SDK** — creating
  staff accounts, deleting staff accounts, and exporting a full data
  backup — go through the **Express backend**, because only a trusted
  server can hold Admin SDK credentials.

Both the frontend and backend are complete, but if you'd prefer to route
*all* reads/writes through the Express API instead of direct Firestore
access, the REST endpoints already exist for every collection (see
`backend/routes/`) — you'd just need to swap the frontend's Firestore
service calls for `apiClient` calls.

## Setup

### 1. Create a Firebase project

In the [Firebase console](https://console.firebase.google.com):
- Create a project.
- Enable **Authentication** (Email/Password provider).
- Enable **Firestore Database**.
- Enable **Storage**.
- Generate a **service account key** (Project Settings → Service Accounts →
  Generate new private key) — save it as
  `backend/firebase/serviceAccountKey.json` (not committed to git), or copy
  its fields into `backend/.env`.

Deploy the provided security rules and indexes:

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # select your project
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set GOOGLE_APPLICATION_CREDENTIALS to your service account
# JSON path, or fill in FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL /
# FIREBASE_PRIVATE_KEY directly.
npm install
npm run dev          # starts on http://localhost:5000
```

Create the first admin account (one-time):

```bash
node scripts/seedAdmin.js "Owner Name" owner@yourbusiness.com "StrongPassword123"
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env with your Firebase web app config (Project Settings > General
# > Your apps > Web app) and VITE_API_BASE_URL pointing at the backend.
npm install
npm run dev           # starts on http://localhost:5173
```

Sign in with the admin account you created, then use **Settings → Users**
to add managers and cashiers.

### 4. Seed starter data (optional)

Once signed in as admin, use the UI to add:
- Currency rates (**Currency → Rates**)
- A cash account and a transfer account (**Bank Accounts**)

Everything else (customers, transactions) is created through normal use.

## Project structure

```
currexpro/
├── frontend/          Vite + React app
│   └── src/
│       ├── components/  (common, layout, dashboard, currency, bank...)
│       ├── pages/
│       ├── layouts/
│       ├── hooks/
│       ├── services/    (Firestore + API clients)
│       ├── context/     (auth, toast notifications)
│       ├── routes/      (protected/role-gated routing)
│       └── firebase/
├── backend/           Express API (admin-only operations + full REST layer)
│   ├── controllers/
│   ├── routes/
│   ├── middleware/     (auth, roles, validation, error handling)
│   ├── services/
│   ├── firebase/       (Admin SDK init)
│   └── scripts/        (seedAdmin.js)
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
└── firebase.json
```

## Known follow-ups

A project this size is never fully "done" in one pass — before handing this
to a client I'd recommend:
- Wire up real translations for the Language setting (currently stores the
  preference but UI strings aren't yet translated).
- Add automated tests (the codebase is structured for it — services and
  controllers are pure and easy to unit test).
- Review Firestore composite indexes against your actual query patterns
  once you have real usage (a few are pre-defined in
  `firestore.indexes.json`, but Firebase will prompt with a direct link
  for any it's still missing).
- Add file upload UI (customer ID scans, receipts) — Firebase Storage is
  wired up and ready, just needs an upload component.


  ## 🚀 Current Progress

- Core currency exchange features have been implemented.
- The application is built with React and Vite.
- Firebase Hosting is configured for deployment.
- CI/CD workflow and project documentation are being improved.

## 📌 Next Steps

- Improve mobile responsiveness.
- Add stronger form validation.
- Expand testing coverage.
- Improve reports and transaction summaries.
