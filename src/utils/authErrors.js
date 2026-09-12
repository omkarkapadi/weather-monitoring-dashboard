const MESSAGES = {
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/user-not-found": "Email or password is incorrect.",
  "auth/wrong-password": "Email or password is incorrect.",
  "auth/email-already-in-use": "That email already has an account. Try logging in.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/operation-not-allowed":
    "Email/password sign-in is not enabled yet. Turn it on in Firebase Console → Authentication.",
  "app/not-approved": "This email is not on the approved list.",
};

export function mapAuthError(error) {
  return MESSAGES[error?.code] || "Something went wrong. Try again.";
}
