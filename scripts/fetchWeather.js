import { pathToFileURL } from "node:url";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { cityDocId, listDistinctCities } from "./cities.js";
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
  await db.collection("ingestStatus").doc(cityDocId(reading.city || city)).set({
    city: reading.city || city,
    lastSuccessAt: new Date(),
    lastError: null,
  });
  return reading;
}

export async function runIngest(env = process.env, fetchFn = fetch) {
  const serviceAccount = loadServiceAccount(env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  const app = initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore(app);
  const snapshot = await db.collection("userProfiles").get();
  const cities = listDistinctCities(
    snapshot.docs.map((profile) => profile.data()),
    env.WEATHER_CITY || "Pune",
  );
  console.log(`Fetching weather for: ${cities.join(", ")}`);
  const results = [];

  for (const city of cities) {
    try {
      results.push(await fetchAndStore({ fetchFn, db, city, apiKey: env.OPENWEATHER_API_KEY }));
    } catch (error) {
      await db.collection("ingestStatus").doc(cityDocId(city)).set({
        city,
        lastError: error.message,
      }, { merge: true });
      throw error;
    }
  }

  return results;
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
    .then((readings) => {
      console.log(`Stored ${readings.length} city reading(s).`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
