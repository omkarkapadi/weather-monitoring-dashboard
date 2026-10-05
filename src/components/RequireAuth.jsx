import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext.jsx";
import { requireApprovedApp } from "../utils/routes.js";

export function RequireAuth({ children }) {
  const { user, authLoading, loading, approved, profile, profileLoading, accessError } =
    useAuthContext();
  const decision = requireApprovedApp({
    user,
    authLoading: authLoading ?? loading,
    approved,
    profile,
    profileLoading: profileLoading ?? false,
    accessError,
  });

  if (decision.status === "loading") {
    return (
      <main className="centered">
        <p>Checking sign-in…</p>
      </main>
    );
  }

  if (decision.status === "error") {
    return (
      <main className="centered">
        <p role="alert">Could not verify access. Refresh and try again.</p>
      </main>
    );
  }

  if (decision.redirectTo) {
    return <Navigate to={decision.redirectTo} replace />;
  }

  return children;
}
