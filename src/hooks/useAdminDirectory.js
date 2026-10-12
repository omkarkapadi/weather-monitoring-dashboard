import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "../firebase.js";
import {
  canChangeUserRole,
  canRevokeInvite,
  matchingProfileIds,
  normalizeEmail,
  validateApprovedEmailInput,
} from "../utils/accessControl.js";

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

export async function promoteProfilesByEmail(updateProfileDoc, users, email, role) {
  const ids = matchingProfileIds(users, email);
  const nextRole = role === "admin" ? "admin" : "member";
  await Promise.all(ids.map((id) => updateProfileDoc(id, { role: nextRole })));
  return ids;
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

  async function addInvite(email, role, actorEmail) {
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
      if (!(normalizeEmail(actorEmail) === check.email && role !== "admin")) {
        await promoteProfilesByEmail(
          (id, data) => updateDoc(doc(getFirebaseDb(), "userProfiles", id), data),
          users,
          check.email,
          role,
        );
      }
      return { ok: true, email: check.email };
    } catch {
      return { ok: false, message: "Could not add that email. Confirm you are an admin." };
    } finally {
      setAdding(false);
    }
  }

  async function removeInvite(email, actorEmail) {
    const check = canRevokeInvite(email, actorEmail);
    if (!check.ok) {
      return check;
    }
    try {
      await deleteDoc(doc(getFirebaseDb(), "approvedEmails", check.email));
      return { ok: true, email: check.email };
    } catch {
      return { ok: false, message: "Could not remove that email. Confirm you are an admin." };
    }
  }

  async function setUserRole(uid, role, actorUid) {
    const check = canChangeUserRole({
      actorUid,
      targetUid: uid,
      nextRole: role === "admin" ? "admin" : "member",
      users,
    });
    if (!check.ok) {
      return check;
    }
    try {
      await updateDoc(doc(getFirebaseDb(), "userProfiles", uid), {
        role: role === "admin" ? "admin" : "member",
      });
      return { ok: true, uid };
    } catch {
      return { ok: false, message: "Could not change that role. Confirm you are an admin." };
    }
  }

  return { invites, users, status, error, adding, addInvite, removeInvite, setUserRole };
}
