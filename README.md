# Weather Monitoring Dashboard

Cloud Computing PBL: a login-gated React dashboard that shows live and historical weather for Pune. Readings are fetched on a schedule and stored in Firestore.

## Architecture

```
OpenWeatherMap
  → GitHub Actions (cron every 15 minutes, or manual Run workflow)
  → scripts/fetchWeather.js (firebase-admin write)
  → Firestore `readings` collection
  → React app (Vite) after Firebase Authentication
  → Firebase Hosting
```

This stays on Firebase **Spark**. There are no Cloud Functions. The GitHub Action is the scheduled compute. The Admin SDK writes bypass security rules; the browser can only **read** after login.

## What each important file does

| File | Why it exists |
| --- | --- |
| `src/firebase.js` | Reads `VITE_*` env vars and starts the Firebase web SDK. |
| `src/components/Login.jsx` | Email/password form with Log in and Create account. |
| `src/hooks/useAuth.js` | Wraps Firebase Auth (`onAuthStateChanged`, sign-in, register, sign-out). |
| `src/hooks/useReadings.js` | Live Firestore query: last 48 readings, newest first. |
| `src/components/CurrentWeather.jsx` | Card for the latest reading. |
| `src/components/WeatherChart.jsx` | Recharts temperature trend. |
| `scripts/parseWeather.js` | Turns OpenWeather JSON into a Firestore document. Tested. |
| `scripts/fetchWeather.js` | Fetches weather and writes with the Admin SDK. |
| `.github/workflows/fetch-weather.yml` | Runs the script on a schedule. |
| `firestore.rules` | Signed-in users can read `readings`. Nobody writes from the client. |

## Local setup

1. Copy `.env.example` to `.env` and fill the Firebase **web** config (Project settings → Your apps).
2. Enable **Email/Password** in Firebase Console → Authentication → Sign-in method.
3. Install and run:

```bash
npm install
npm test
npm run dev
```

Open http://localhost:5173. Create an account on the login screen, then sign in.

The weather API key and the Firebase service account stay in **GitHub Actions secrets**. They are never put in `.env` or the React bundle.

## Commands you run (not the coding agent)

```bash
npm install -g firebase-tools
firebase login
firebase use fir-5baf2
firebase deploy --only firestore:rules

git add .
git commit -m "feat: weather dashboard with Actions ingest and Auth"
git push
```

Then on GitHub: **Actions → Fetch weather → Run workflow**. That writes the first reading. The dashboard updates live via `onSnapshot`.

Later, for a public demo URL:

```bash
npm run build
firebase deploy --only hosting
```

The site will be `https://fir-5baf2.web.app`.

## Create a demo user

- **In the app:** enter an email and a 6+ character password, click **Create account**.
- **Or in Console:** Authentication → Users → Add user.

## Tests

```bash
npm test
npm run test:coverage
```

Helpers (`parseWeather`, `fetchAndStore`, Firebase config, mappers) are covered with Vitest. The ingest tests mock `fetch` and Firestore — they do not call OpenWeather or use a real service account.
