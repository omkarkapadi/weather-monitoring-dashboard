import { useAuthContext } from "../context/AuthContext.jsx";

export function NotApprovedPage() {
  const { user, logout } = useAuthContext();

  return (
    <main className="auth-shell">
      <article className="panel-card">
        <p className="eyebrow">Invite only</p>
        <h1>Account not approved</h1>
        <p className="lede">
          This email is not on the invite list, so the dashboard stays closed.
        </p>
        <p className="meta">{user?.email}</p>
        <button type="button" className="secondary" onClick={logout}>
          Log out
        </button>
      </article>
    </main>
  );
}
