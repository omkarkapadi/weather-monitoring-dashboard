# Phase F bundle report

`npm run build` (Vite 6.4.3), 2026-10-05.

| File | Raw | Gzip | Why it is this size |
| --- | ---: | ---: | --- |
| `dist/index.html` | 0.42 kB | 0.29 kB | Shell |
| `dist/assets/index-*.css` | 15.40 kB | 3.96 kB | App theme, landing, tabs |
| `dist/assets/PlaceMap-*.css` | 15.61 kB | 6.46 kB | Leaflet |
| `dist/assets/WeatherTrendChart-*.js` | 1.81 kB | 0.78 kB | Lazy dashboard chart wrapper |
| `dist/assets/ArchiveChart-*.js` | 1.84 kB | 0.79 kB | Lazy history chart wrapper |
| `dist/assets/MapPage-*.js` | 5.09 kB | 2.22 kB | Radar + save place |
| `dist/assets/HistoryPage-*.js` | 5.71 kB | 2.42 kB | Archive + CSV |
| `dist/assets/PlaceMap-*.js` | 158.30 kB | 49.91 kB | Leaflet runtime |
| `dist/assets/LineChart-*.js` | 393.71 kB | 108.15 kB | Recharts |
| `dist/assets/index-*.js` | 792.16 kB | 212.04 kB | React, Router, Firebase, dashboard |

Vite warns that the main JS chunk is over 500 kB minified. Forecast/air/archive stay out of Firestore; the heavy client cost is Firebase Auth/SDK + Recharts + Leaflet, not weather JSON.
