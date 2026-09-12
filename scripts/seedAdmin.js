import { pathToFileURL } from "node:url";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { loadServiceAccount } from "./fetchWeather.js";

export const DEFAULT_ADMIN_EMAIL = "omkar.kapadi@mitwpu.edu.in";

export async function seedAdmin(db, email = DEFAULT_ADMIN_EMAIL) {
  const normalized = String(email).trim().toLowerCase();
  await db.collection("approvedEmails").doc(normalized).set(
    {
      email: normalized,
      role: "admin",
      addedAt: new Date(),
    },
    { merge: true },
  );

  const profiles = await db.collection("userProfiles").where("email", "==", normalized).get();
  const promoted = [];
  await Promise.all(
    profiles.docs.map(async (profile) => {
      await profile.ref.update({ role: "admin" });
      promoted.push(profile.id);
    }),
  );

  return { email: normalized, promoted };
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  try {
    return import.meta.url === pathToFileURL(entry).href;
  } catch {
    return false;
  }
}

if (isDirectRun()) {
  const serviceAccount = loadServiceAccount(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  const app = initializeApp({ credential: cert(serviceAccount) });
  seedAdmin(getFirestore(app), process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL)
    .then((result) => {
      console.log(`Approved ${result.email}. Promoted profiles: ${result.promoted.length}`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
