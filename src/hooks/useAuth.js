import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirebaseAuth } from "../firebase.js";
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
      run(() => createUserWithEmailAndPassword(getFirebaseAuth(), email, password)),
    logout: () => run(() => signOut(getFirebaseAuth())),
  };
}
