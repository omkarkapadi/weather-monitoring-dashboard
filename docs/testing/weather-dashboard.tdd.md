# TDD evidence: weather dashboard Phases 1–4

Source plan: weather dashboard PBL (Actions ingest, Firebase Auth + Firestore).

## User journeys

- As a student, I want env config to fail fast so a missing Firebase key does not boot a broken app.
- As a scheduled job, I want OpenWeather JSON parsed into a Firestore reading so history stays consistent.
- As a scheduled job, I want a missing API key or HTTP error to skip writes so Firestore is never garbage.
- As a signed-in user, I want the latest reading and a temperature chart so I can explain live + historical data.

## Results

| # | Guarantee | Test | Type | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Missing `VITE_FIREBASE_*` throws a listed error | `src/firebase.test.js` | unit | PASS | `npm test` |
| 2 | Complete env creates a Firebase app | `src/firebase.test.js` | unit | PASS | `npm test` |
| 3 | OpenWeather payload maps to a reading | `scripts/parseWeather.test.js` | unit | PASS | `npm test` |
| 4 | Missing temp or `weather[0]` throws | `scripts/parseWeather.test.js` | unit | PASS | `npm test` |
| 5 | `fetchAndStore` writes only after a successful fetch | `scripts/fetchWeather.test.js` | integration (mocked) | PASS | `npm test` |
| 6 | Missing key / HTTP 401 does not write | `scripts/fetchWeather.test.js` | integration (mocked) | PASS | `npm test` |
| 7 | Display mapper survives null readings | `src/utils/weatherMappers.test.js` | unit | PASS | `npm test` |
| 8 | Login validates empty fields | `src/components/Login.test.jsx` | component | PASS | `npm test` |
| 9 | CurrentWeather renders temperature | `src/components/CurrentWeather.test.jsx` | component | PASS | `npm test` |

## Coverage

`npm run test:coverage` — helpers above 80% (lines ~96%, functions 100% on instrumented files).

Intentional gaps: `runIngest` CLI `console` path when executed as main; React hooks talk to live Firebase and are verified in `npm run dev`.
