import { useState } from "react";
import { Skeleton } from "../components/Skeleton.jsx";
import { useAdminDirectory } from "../hooks/useAdminDirectory.js";
import { validateApprovedEmailInput } from "../utils/accessControl.js";

export function AdminPage() {
  const { invites, users, status, error, adding, addInvite } = useAdminDirectory(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [formMessage, setFormMessage] = useState("");

  async function handleAdd(event) {
    event.preventDefault();
    const check = validateApprovedEmailInput(email);
    if (!check.ok) {
      setFormMessage(check.message);
      return;
    }
    const result = await addInvite(email, role);
    if (!result.ok) {
      setFormMessage(result.message);
      return;
    }
    setFormMessage("");
    setEmail("");
    setRole("member");
  }

  return (
    <section className="admin-grid">
      <article className="panel-card admin-card">
        <p className="eyebrow">Access control</p>
        <h2>Approved emails</h2>
        <p className="lede">Only these emails can create an account.</p>
        <form className="invite-form" onSubmit={handleAdd}>
          <label htmlFor="invite-email">Email</label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="off"
          />
          <label htmlFor="invite-role">Role</label>
          <select id="invite-role" value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="member">member</option>
            <option value="admin">admin</option>
          </select>
          {formMessage ? (
            <p className="banner banner-error" role="alert">
              {formMessage}
            </p>
          ) : null}
          <button type="submit" disabled={adding}>
            {adding ? "Adding…" : "Add email"}
          </button>
        </form>
        {status === "loading" ? <Skeleton lines={3} /> : null}
        {status === "ready" && invites.length === 0 ? (
          <p className="empty">No approved emails yet.</p>
        ) : null}
        {invites.length > 0 ? (
          <ul className="data-list">
            {invites.map((invite) => (
              <li key={invite.id}>
                <strong>{invite.email || invite.id}</strong>
                <span className="role-pill">{invite.role || "member"}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </article>

      <article className="panel-card admin-card">
        <p className="eyebrow">Directory</p>
        <h2>Registered users</h2>
        <p className="lede">Accounts that have signed in at least once.</p>
        {status === "loading" ? <Skeleton lines={3} /> : null}
        {status === "ready" && users.length === 0 ? <p className="empty">No members yet.</p> : null}
        {error ? (
          <p className="banner banner-error" role="alert">
            {error}
          </p>
        ) : null}
        {users.length > 0 ? (
          <ul className="data-list">
            {users.map((person) => (
              <li key={person.id}>
                <strong>{person.email || person.id}</strong>
                <span className="role-pill">{person.role || "member"}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    </section>
  );
}
