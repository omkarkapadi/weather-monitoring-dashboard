import { pathToFileURL } from "node:url";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { parseWeather } from "./parseWeather.js";

const OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

export function loadServiceAccount(jsonString) {
  if (!jsonString || !String(jsonString).trim()) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON is required");
  }

  try {
    return JSON.parse(jsonString);
  } catch {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON");
  }
}

export async function fetchAndStore({ fetchFn, db, city, apiKey }) {
  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY is required");
  }

  const url = `${OPENWEATHER_URL}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
  const response = await fetchFn(url);

  if (!response.ok) {
    throw new Error(`OpenWeather request failed: ${response.status}`);
  }

  const payload = await response.json();
  const reading = parseWeather(payload);
  await db.collection("readings").add({ ...reading });
  return reading;
}

export async function runIngest(env = process.env, fetchFn = fetch) {
  const serviceAccount = loadServiceAccount(env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  const app = initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore(app);

  return fetchAndStore({
    fetchFn,
    db,
    city: env.WEATHER_CITY || "Pune",
    apiKey: env.OPENWEATHER_API_KEY,
  });
}

export function isDirectRun(metaUrl = import.meta.url, argv1 = process.argv[1]) {
  if (!argv1) {
    return false;
  }

  try {
    return metaUrl === pathToFileURL(argv1).href;
  } catch {
    return false;
  }
}

if (isDirectRun()) {
  runIngest()
    .then((reading) => {
      console.log(`Stored ${reading.city} reading: ${reading.temperature}°C`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
