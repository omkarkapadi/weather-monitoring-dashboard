import { useEffect, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "../firebase.js";
import { normalizeEmail } from "../utils/accessControl.js";
import { firestoreErrorMessage } from "../utils/firestoreError.js";
import { buildSafeProfileUpdate, validateSettings } from "../utils/profileUpdate.js";
import { DEFAULT_HOME } from "../weather/locationId.js";
import { defaultUnits } from "../weather/units.js";

export async function applyProfileUpdate(writeUpdate, input) {
  const check = validateSettings(input);
  if (!check.ok) {
    return check;
  }

  const payload = buildSafeProfileUpdate(input);
  try {
    await writeUpdate(payload);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: firestoreErrorMessage(error, "Could not save settings."),
    };
  }
}

export function buildNewProfile(user) {
  return {
    email: normalizeEmail(user.email),
    displayName: user.displayName || "",
    role: "member",
    preferredLocation: { ...DEFAULT_HOME },
    units: defaultUnits(),
    notificationsEnabled: false,
  };
}

export function useProfile(user, approved) {
  const [profile, setProfile] = useState(undefined);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user || approved !== true) {
      setProfile(user && approved === undefined ? undefined : null);
      setError(false);
      return undefined;
    }

    const ref = doc(getFirebaseDb(), "userProfiles", user.uid);
    let creating = false;
    let cancelled = false;
    setProfile(undefined);
    setError(false);

    const unsubscribe = onSnapshot(
      ref,
      async (snap) => {
        if (cancelled) {
          return;
        }
        if (snap.exists()) {
          setProfile({ id: snap.id, ...snap.data() });
          setError(false);
          return;
        }
        if (creating) {
          return;
        }
        creating = true;
        try {
          await setDoc(ref, {
            ...buildNewProfile(user),
            createdAt: serverTimestamp(),
          });
        } catch {
          creating = false;
          if (!cancelled) {
            setError(true);
          }
        }
      },
      () => {
        if (!cancelled) {
          setError(true);
        }
      },
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user, approved]);

  async function updateProfile(input) {
    if (!user) {
      return { ok: false, message: "Sign in to save settings." };
    }

    return applyProfileUpdate(
      (payload) => updateDoc(doc(getFirebaseDb(), "userProfiles", user.uid), payload),
      input,
    );
  }

  return {
    profile,
    error,
    loading: Boolean(user) && approved === true && profile === undefined && !error,
    role: profile?.role || "member",
    updateProfile,
  };
}
