import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const CONFIG_KEYS = {
  apiKey: "VITE_FIREBASE_API_KEY",
  authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "VITE_FIREBASE_PROJECT_ID",
  storageBucket: "VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "VITE_FIREBASE_APP_ID",
};

export function getFirebaseConfig(env) {
  const config = Object.fromEntries(
    Object.entries(CONFIG_KEYS).map(([field, envName]) => [field, env?.[envName]]),
  );
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([field]) => field);

  if (missing.length > 0) {
    throw new Error(`Missing Firebase config: ${missing.join(", ")}`);
  }

  return config;
}

export function createFirebaseApp(env, appName) {
  return initializeApp(getFirebaseConfig(env), appName);
}

let app;

export function getFirebaseApp() {
  if (!app) {
    app = createFirebaseApp(import.meta.env);
  }
  return app;
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}
