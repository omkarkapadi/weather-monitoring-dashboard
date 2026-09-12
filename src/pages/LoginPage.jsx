import { Link } from "react-router-dom";
import { Login } from "../components/Login.jsx";
import { useAuthContext } from "../context/AuthContext.jsx";

export function LoginPage() {
  const { login, register, error, pending } = useAuthContext();

  return (
    <main className="auth-shell">
      <div className="auth-stack">
        <Link className="back-link" to="/">
          Back to overview
        </Link>
        <Login onLogin={login} onRegister={register} error={error} pending={pending} />
      </div>
    </main>
  );
}
