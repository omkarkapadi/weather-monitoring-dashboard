import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "../firebase.js";
import { mergeCityOptions } from "../utils/cities.js";

export function mapIngestCities(docs) {
  return mergeCityOptions(
    "",
    (docs || []).map((entry) => entry?.city),
  );
}

export function useIngestCities(enabled) {
  const [cities, setCities] = useState([]);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!enabled) {
      setCities([]);
      setStatus("idle");
      return undefined;
    }

    setStatus("loading");
    return onSnapshot(
      collection(getFirebaseDb(), "ingestStatus"),
      (snapshot) => {
        setCities(
          mapIngestCities(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))),
        );
        setStatus("ready");
      },
      () => {
        setStatus("error");
      },
    );
  }, [enabled]);

  return { cities, status };
}
