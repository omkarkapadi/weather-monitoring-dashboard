export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isAdmin(role) {
  return role === "admin";
}

export function isApproved(snapshotExists) {
  return snapshotExists === true;
}

export function validateApprovedEmailInput(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return { ok: false, message: "Enter an email address." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, message: "Enter a valid email address." };
  }
  return { ok: true, email: normalized };
}

export function canRevokeInvite(email, actorEmail) {
  const check = validateApprovedEmailInput(email);
  if (!check.ok) {
    return check;
  }
  if (check.email === normalizeEmail(actorEmail)) {
    return { ok: false, message: "You cannot remove your own invite." };
  }
  return { ok: true, email: check.email };
}

export function canChangeUserRole({ actorUid, targetUid, nextRole, users }) {
  if (!targetUid) {
    return { ok: false, message: "Missing user." };
  }
  if (nextRole !== "admin" && actorUid && actorUid === targetUid) {
    return { ok: false, message: "You cannot demote your own admin role." };
  }
  if (nextRole !== "admin") {
    const otherAdmins = (users || []).filter(
      (person) => person?.role === "admin" && person?.id !== targetUid,
    );
    const targetIsAdmin = (users || []).some(
      (person) => person?.id === targetUid && person?.role === "admin",
    );
    if (targetIsAdmin && otherAdmins.length === 0) {
      return { ok: false, message: "Keep at least one admin." };
    }
  }
  return { ok: true };
}

export function matchingProfileIds(users, email) {
  const id = normalizeEmail(email);
  return (users || [])
    .filter((person) => normalizeEmail(person?.email) === id && person?.id)
    .map((person) => person.id);
}

export async function ensureEmailApproved(getApprovedDoc, email) {
  const id = normalizeEmail(email);
  const notApproved = Object.assign(new Error("This email is not on the approved list."), {
    code: "app/not-approved",
  });

  if (!id) {
    throw notApproved;
  }

  const snap = await getApprovedDoc(id);
  if (!snap || !snap.exists()) {
    throw notApproved;
  }

  return snap.data();
}
