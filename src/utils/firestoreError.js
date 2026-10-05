export function firestoreErrorMessage(error, fallback) {
  if (error?.code === "permission-denied") {
    return "Permission denied. Deploy the latest Firestore rules, then try again.";
  }
  return fallback;
}
