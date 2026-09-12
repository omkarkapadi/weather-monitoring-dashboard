import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext.jsx";
import { useIngestCities } from "../hooks/useIngestCities.js";
import { mergeCityOptions, resolvePreferredCityInput, validateSettings } from "../utils/cities.js";

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
  const ingest = useIngestCities(Boolean(user));
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [preferredCity, setPreferredCity] = useState(profile?.preferredCity || "Pune");
  const [addedCity, setAddedCity] = useState("");
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const cityOptions = mergeCityOptions(preferredCity, ingest.cities);

  useEffect(() => {
    setDisplayName(profile?.displayName || "");
    setPreferredCity(profile?.preferredCity || "Pune");
  }, [profile?.displayName, profile?.preferredCity]);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextCity = resolvePreferredCityInput(preferredCity, addedCity);
    const check = validateSettings({ preferredCity: nextCity });
    if (!check.ok) {
      setSaved(false);
      setMessage(check.message);
      return;
    }

    setSaving(true);
    const result = await updateProfile({ displayName, preferredCity: nextCity });
    setSaving(false);
    if (!result.ok) {
      setSaved(false);
      setMessage(result.message);
      return;
    }
    setPreferredCity(nextCity);
    setAddedCity("");
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
          <select
            id="preferred-city"
            value={preferredCity}
            onChange={(event) => setPreferredCity(event.target.value)}
          >
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <p className="meta">
            {ingest.cities.length > 0
              ? "These are the cities currently tracked in ingestStatus."
              : "No other tracked cities yet. Add one below, save, then run Fetch weather."}
          </p>
          <label htmlFor="new-city">Add a new city</label>
          <input
            id="new-city"
            value={addedCity}
            onChange={(event) => setAddedCity(event.target.value)}
            autoComplete="off"
            placeholder="Optional — e.g. Nashik"
          />
          {ingest.status === "error" ? (
            <p className="banner banner-error" role="alert">
              Could not load tracked cities. Deploy firestore.rules, then refresh.
            </p>
          ) : null}
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
