import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "../firebase.js";
import { mapIngestStatus } from "../utils/ingestStatus.js";

export function useIngestStatus(enabled) {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) {
      setRows([]);
      setStatus("idle");
      setError("");
      return undefined;
    }

    setStatus("loading");
    return onSnapshot(
      collection(getFirebaseDb(), "ingestStatus"),
      (snapshot) => {
        setRows(mapIngestStatus(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))));
        setStatus("ready");
        setError("");
      },
      () => {
        setStatus("error");
        setError("Could not load ingest status.");
      },
    );
  }, [enabled]);

  return { rows, status, error };
}
