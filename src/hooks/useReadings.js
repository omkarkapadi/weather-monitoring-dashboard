import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { getFirebaseDb } from "../firebase.js";

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

export function useReadings(enabled) {
  const [readings, setReadings] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) {
      setReadings([]);
      setStatus("idle");
      setError("");
      return undefined;
    }

    setStatus("loading");
    const readingsQuery = query(
      collection(getFirebaseDb(), "readings"),
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
        setError(
          err.code === "permission-denied"
            ? "Firestore blocked this read. Deploy firestore.rules, then sign in again."
            : "Could not load weather history.",
        );
      },
    );
  }, [enabled]);

  return { readings, status, error, latest: readings[0] ?? null };
}
