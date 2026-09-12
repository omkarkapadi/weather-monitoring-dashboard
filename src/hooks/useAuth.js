import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "../firebase.js";
import { ensureEmailApproved, normalizeEmail } from "../utils/accessControl.js";
import { mapAuthError } from "../utils/authErrors.js";

export function useAuth() {
  const [user, setUser] = useState(undefined);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
    });
  }, []);

  async function run(action) {
    setError("");
    setPending(true);
    try {
      await action();
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setPending(false);
    }
  }

  return {
    user,
    error,
    pending,
    loading: user === undefined,
    login: (email, password) =>
      run(() => signInWithEmailAndPassword(getFirebaseAuth(), email, password)),
    register: (email, password) =>
      run(async () => {
        await ensureEmailApproved(
          (id) => getDoc(doc(getFirebaseDb(), "approvedEmails", id)),
          email,
        );
        return createUserWithEmailAndPassword(
          getFirebaseAuth(),
          normalizeEmail(email),
          password,
        );
      }),
    logout: () => run(() => signOut(getFirebaseAuth())),
  };
}
