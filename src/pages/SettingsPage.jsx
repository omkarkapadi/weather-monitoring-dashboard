import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext.jsx";
import { validateSettings } from "../utils/cities.js";

function formatCreatedAt(value) {
  if (!value) {
    return "Not recorded yet";
  }
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not recorded yet";
  }
  return date.toLocaleString();
}

export function SettingsPage() {
  const { user, profile, role, updateProfile } = useAuthContext();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [preferredCity, setPreferredCity] = useState(profile?.preferredCity || "Pune");
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.displayName || "");
    setPreferredCity(profile?.preferredCity || "Pune");
  }, [profile?.displayName, profile?.preferredCity]);

  async function handleSubmit(event) {
    event.preventDefault();
    const check = validateSettings({ preferredCity });
    if (!check.ok) {
      setSaved(false);
      setMessage(check.message);
      return;
    }

    setSaving(true);
    const result = await updateProfile({ displayName, preferredCity });
    setSaving(false);
    if (!result.ok) {
      setSaved(false);
      setMessage(result.message);
      return;
    }
    setMessage("");
    setSaved(true);
  }

  return (
    <section className="settings-grid">
      <article className="panel-card settings-card">
        <p className="eyebrow">Account</p>
        <h2>Settings</h2>
        <p className="lede">Change how your name and default city appear. Role stays admin-managed.</p>
        <dl className="readonly-fields">
          <div>
            <dt>Email</dt>
            <dd>{user?.email || profile?.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{role || profile?.role || "member"}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{formatCreatedAt(profile?.createdAt)}</dd>
          </div>
        </dl>
        <form className="settings-form" onSubmit={handleSubmit}>
          <label htmlFor="display-name">Display name</label>
          <input
            id="display-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            autoComplete="name"
          />
          <label htmlFor="preferred-city">Preferred city</label>
          <input
            id="preferred-city"
            value={preferredCity}
            onChange={(event) => setPreferredCity(event.target.value)}
            autoComplete="off"
          />
          {message ? (
            <p className="banner banner-error" role="alert">
              {message}
            </p>
          ) : null}
          {saved ? <p className="banner">Settings saved.</p> : null}
          <button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </button>
        </form>
      </article>
    </section>
  );
}
