import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { getFirebaseDb } from "../firebase.js";

export function canQueryReadings(enabled, city) {
  return Boolean(enabled && String(city || "").trim());
}

export function readingsErrorMessage(err) {
  if (err?.code === "permission-denied") {
    return "Firestore blocked this read. Deploy firestore.rules, then sign in again.";
  }
  if (err?.code === "failed-precondition") {
    return "This city query needs a Firestore index. Deploy firestore.indexes.json, then refresh.";
  }
  return "Could not load weather history.";
}

function toDate(value) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value.toDate === "function") {
    return value.toDate();
  }
  return new Date(value);
}

export function useReadings(enabled, city) {
  const [readings, setReadings] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!canQueryReadings(enabled, city)) {
      setReadings([]);
      setStatus("idle");
      setError("");
      return undefined;
    }

    setStatus("loading");
    const readingsQuery = query(
      collection(getFirebaseDb(), "readings"),
      where("city", "==", city),
      orderBy("fetchedAt", "desc"),
      limit(48),
    );

    return onSnapshot(
      readingsQuery,
      (snapshot) => {
        const next = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            fetchedAt: toDate(data.fetchedAt),
          };
        });
        setReadings(next);
        setStatus(next.length === 0 ? "empty" : "ready");
        setError("");
      },
      (err) => {
        setStatus("error");
        setError(readingsErrorMessage(err));
      },
    );
  }, [enabled, city]);

  return { readings, status, error, latest: readings[0] ?? null };
}
