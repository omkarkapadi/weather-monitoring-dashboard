import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "../firebase.js";
import { validateApprovedEmailInput } from "../utils/accessControl.js";

function mapDocs(snapshot) {
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function submitApprovedEmail(setInviteDoc, email, role = "member") {
  const check = validateApprovedEmailInput(email);
  if (!check.ok) {
    return check;
  }

  await setInviteDoc(check.email, {
    email: check.email,
    role: role === "admin" ? "admin" : "member",
    addedAt: new Date(),
  });
  return { ok: true, email: check.email };
}

export function useAdminDirectory(enabled) {
  const [invites, setInvites] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setInvites([]);
      setUsers([]);
      setStatus("idle");
      return undefined;
    }

    setStatus("loading");
    const db = getFirebaseDb();
    let invitesReady = false;
    let usersReady = false;

    function markReady() {
      if (invitesReady && usersReady) {
        setStatus("ready");
      }
    }

    const unsubInvites = onSnapshot(
      collection(db, "approvedEmails"),
      (snapshot) => {
        setInvites(mapDocs(snapshot));
        invitesReady = true;
        markReady();
        setError("");
      },
      () => {
        setStatus("error");
        setError("Could not load the approved email list.");
      },
    );

    const unsubUsers = onSnapshot(
      collection(db, "userProfiles"),
      (snapshot) => {
        setUsers(mapDocs(snapshot));
        usersReady = true;
        markReady();
        setError("");
      },
      () => {
        setStatus("error");
        setError("Could not load registered users.");
      },
    );

    return () => {
      unsubInvites();
      unsubUsers();
    };
  }, [enabled]);

  async function addInvite(email, role) {
    const check = validateApprovedEmailInput(email);
    if (!check.ok) {
      return check;
    }

    setAdding(true);
    try {
      await setDoc(doc(getFirebaseDb(), "approvedEmails", check.email), {
        email: check.email,
        role: role === "admin" ? "admin" : "member",
        addedAt: serverTimestamp(),
      });
      return { ok: true, email: check.email };
    } catch {
      return { ok: false, message: "Could not add that email. Confirm you are an admin." };
    } finally {
      setAdding(false);
    }
  }

  return { invites, users, status, error, adding, addInvite };
}
