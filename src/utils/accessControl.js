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
