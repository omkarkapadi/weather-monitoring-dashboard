# Weather Monitoring Dashboard

Cloud Computing PBL: invite-only React weather desk for any pin on the map. The browser fetches Open-Meteo on demand. Firebase Auth and Firestore (Spark) protect the app, profiles, and saved places — not the public weather APIs.

Live demo (after hosting deploy): `https://fir-5baf2.web.app`

## Architecture

```
Browser (Vite + React)
  → Open-Meteo forecast / air / archive   (no API key, CC BY 4.0)
  → RainViewer radar tiles                (map page only)
  → OpenStreetMap via Leaflet
  → Firebase Auth + Firestore             (profiles, savedPlaces, invite list)
  → Firebase Hosting
```

This stays on Firebase **Spark**. There are no Cloud Functions.

Weather is **on-demand**, not scheduled. Opening Dashboard, Map, or History triggers a client fetch. Results are cached in `sessionStorage` (10 min forecast, 5 min radar, 60 min archive). An optional GitHub Action still exists for an older `readings` ingest path; the live desk does not wait on it.

Access control is separate from weather data:

| Public | Protected |
| --- | --- |
| Open-Meteo, RainViewer, OSM tiles | `/app/*` routes after Auth |
| Landing page | `approvedEmails` invite list |
| | `userProfiles` and `savedPlaces` (max 20) |

Client alerts (heat, cold, storm, AQI) are computed in the browser. They are **not** an official warning feed and only notify while the tab is open (Notification API, once per alert id).

## What each important file does

| File | Why it exists |
| --- | --- |
| `src/firebase.js` | Reads `VITE_*` env vars and starts the Firebase web SDK. |
| `src/pages/LandingPage.jsx` | Public hero, four features, and a mock preview. |
| `src/pages/DashboardPage.jsx` | Pin, current/hourly/daily, AQI, saved places, alerts. |
| `src/pages/MapPage.jsx` | Leaflet explorer + RainViewer playback + save place. |
| `src/pages/HistoryPage.jsx` | Archive range for home + CSV of shown rows. |
| `src/layout/AppShell.jsx` | Sidebar on desktop; bottom tabs + drawer on compact. |
| `src/weather/openMeteo.js` | Forecast + air quality client. |
| `src/weather/notifyAlerts.js` | Once-per-id Notification helper. |
| `firestore.rules` | Invite list + role lock. Members cannot change their own `role`. |
| `scripts/seedAdmin.js` | Approves `omkar.kapadi@mitwpu.edu.in` and promotes that profile to admin. |

## Local setup

1. Copy `.env.example` to `.env` and fill the Firebase **web** config (Project settings → Your apps).
2. Enable **Email/Password** in Firebase Console → Authentication → Sign-in method.
3. Install and run:

```bash
npm install
npm test
npm run dev
```

Open http://localhost:5173. **Create account only works for emails in `approvedEmails`.** Seed the admin email first (below).

Do not put a weather API key or a Firebase service account in `.env` or the React bundle. Open-Meteo and RainViewer are keyless. Admin scripts use GitHub Actions secrets.

## Commands you run (not the coding agent)

```bash
npm install -g firebase-tools
firebase login
firebase use fir-5baf2
firebase deploy --only firestore:rules

# After you push this branch: GitHub → Actions → Seed admin → Run workflow
# Then create your account with omkar.kapadi@mitwpu.edu.in
# Run Seed admin a second time so your userProfiles role becomes admin.
```

Firestore rules on Hosting do not update until you deploy them. The rules emulator needs **JDK 21**.

Later, for a public demo URL:

```bash
npm run build
firebase deploy --only hosting
```

The site will be `https://fir-5baf2.web.app`.

## Create a demo user

- Seed `omkar.kapadi@mitwpu.edu.in` via **Actions → Seed admin**, then **Create account** in the app.
- Teammates can sign up only after an admin adds their email. Until then, only the seed script can add emails (Admin SDK).

## Tests

```bash
npm test
npm run test:coverage
npm run test:rules
```

Vitest covers mappers, weather helpers, pages, and rules (rules need the emulator + JDK 21). Ingest tests mock `fetch` and Firestore.

Viva talking points: [docs/viva-notes.md](docs/viva-notes.md).
