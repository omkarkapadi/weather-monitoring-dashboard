import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "../firebase.js";
import { isApproved, normalizeEmail } from "../utils/accessControl.js";

export function approvedFromSnapshot(user, snap) {
  if (!user) {
    return null;
  }
  return isApproved(snap?.exists());
}

export function useApproved(user) {
  const [approved, setApproved] = useState(undefined);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) {
      setApproved(null);
      setError(false);
      return undefined;
    }

    let cancelled = false;
    setApproved(undefined);
    setError(false);
    getDoc(doc(getFirebaseDb(), "approvedEmails", normalizeEmail(user.email)))
      .then((snap) => {
        if (!cancelled) {
          setApproved(approvedFromSnapshot(user, snap));
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return {
    approved,
    error,
    loading: Boolean(user) && approved === undefined && !error,
  };
}
