import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext.jsx";
import { requireAdmin } from "../utils/routes.js";

export function AdminRoute({ children }) {
  const { role, loading } = useAuthContext();
  const decision = requireAdmin(role, loading);

  if (decision.status === "loading") {
    return (
      <section className="panel-card">
        <p>Checking admin access…</p>
      </section>
    );
  }

  if (decision.redirectTo) {
    return <Navigate to={decision.redirectTo} replace />;
  }

  return children;
}
