import { useState } from "react";

export function Login({ onLogin, onRegister, error, pending }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  function validate() {
    if (!email.trim() || !password) {
      setLocalError("Enter both email and password.");
      return false;
    }
    setLocalError("");
    return true;
  }

  async function handleLogin(event) {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    await onLogin(email.trim(), password);
  }

  async function handleRegister() {
    if (!validate()) {
      return;
    }
    await onRegister(email.trim(), password);
  }

  const message = localError || error;

  return (
    <section className="auth-card" aria-labelledby="login-title">
      <p className="eyebrow">Cloud Computing PBL</p>
      <h1 id="login-title">Weather Monitor</h1>
      <p className="lede">
        Sign in with an approved team email. Create account only works if an admin
        has already added you to the invite list.
      </p>
      <form className="auth-form" onSubmit={handleLogin}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {message ? (
          <p className="banner banner-error" role="alert">
            {message}
          </p>
        ) : null}
        <div className="auth-actions">
          <button type="submit" disabled={pending}>
            {pending ? "Working…" : "Log in"}
          </button>
          <button type="button" className="secondary" disabled={pending} onClick={handleRegister}>
            Create account
          </button>
        </div>
      </form>
    </section>
  );
}
