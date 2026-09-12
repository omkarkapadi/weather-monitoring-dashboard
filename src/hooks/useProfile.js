import { useEffect, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "../firebase.js";
import { normalizeEmail } from "../utils/accessControl.js";

export function buildNewProfile(user, city = "Pune") {
  return {
    email: normalizeEmail(user.email),
    displayName: user.displayName || "",
    role: "member",
    preferredCity: city,
    notificationsEnabled: false,
  };
}

export function useProfile(user) {
  const [profile, setProfile] = useState(undefined);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return undefined;
    }

    const ref = doc(getFirebaseDb(), "userProfiles", user.uid);
    let creating = false;

    return onSnapshot(
      ref,
      async (snap) => {
        if (snap.exists()) {
          setProfile({ id: snap.id, ...snap.data() });
          return;
        }
        if (creating) {
          return;
        }
        creating = true;
        try {
          await setDoc(ref, {
            ...buildNewProfile(user, import.meta.env.VITE_WEATHER_CITY || "Pune"),
            createdAt: serverTimestamp(),
          });
        } catch {
          creating = false;
          setProfile(null);
        }
      },
      () => {
        setProfile(null);
      },
    );
  }, [user]);

  return {
    profile,
    loading: Boolean(user) && profile === undefined,
    role: profile?.role || "member",
  };
}
