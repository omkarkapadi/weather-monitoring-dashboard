import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "../firebase.js";
import { isValidCoords, toLocationId } from "../weather/locationId.js";
import { firestoreErrorMessage } from "../utils/firestoreError.js";
import { buildSavedPlace, canAddSavedPlace } from "../utils/savedPlaces.js";

export function useSavedPlaces(uid) {
  const [places, setPlaces] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uid) {
      setPlaces([]);
      setStatus("idle");
      setError("");
      return undefined;
    }

    setStatus("loading");
    setError("");
    return onSnapshot(
      collection(getFirebaseDb(), "userProfiles", uid, "savedPlaces"),
      (snapshot) => {
        setPlaces(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
        setStatus("ready");
        setError("");
      },
      (err) => {
        setStatus("error");
        setError(firestoreErrorMessage(err, "Could not load saved places."));
      },
    );
  }, [uid]);

  async function addPlace(location) {
    if (!uid) {
      return { ok: false, message: "Sign in to save a place." };
    }
    if (!canAddSavedPlace(places.length)) {
      return { ok: false, message: "You can save up to 20 places." };
    }
    const payload = buildSavedPlace(location);
    if (!isValidCoords(payload.lat, payload.lon)) {
      return { ok: false, message: "Drop a pin before saving." };
    }
    const id = toLocationId(payload.lat, payload.lon);
    try {
      await setDoc(doc(getFirebaseDb(), "userProfiles", uid, "savedPlaces", id), {
        ...payload,
        addedAt: serverTimestamp(),
      });
      return { ok: true, id };
    } catch (err) {
      return { ok: false, message: firestoreErrorMessage(err, "Could not save that place.") };
    }
  }

  async function removePlace(id) {
    if (!uid) {
      return { ok: false, message: "Sign in first." };
    }
    try {
      await deleteDoc(doc(getFirebaseDb(), "userProfiles", uid, "savedPlaces", id));
      return { ok: true };
    } catch (err) {
      return { ok: false, message: firestoreErrorMessage(err, "Could not remove that place.") };
    }
  }

  return { places, status, error, addPlace, removePlace };
}
