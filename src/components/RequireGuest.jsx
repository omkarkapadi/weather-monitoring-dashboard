import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext.jsx";
import { requireGuest } from "../utils/routes.js";

export function RequireGuest({ children }) {
  const { user, loading } = useAuthContext();
  const decision = requireGuest(user, loading);

  if (decision.status === "loading") {
    return (
      <main className="centered">
        <p>Checking sign-in…</p>
      </main>
    );
  }

  if (decision.redirectTo) {
    return <Navigate to={decision.redirectTo} replace />;
  }

  return children;
}
