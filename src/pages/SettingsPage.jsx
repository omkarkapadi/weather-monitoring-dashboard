import { useEffect, useRef, useState } from "react";
import { PlacePicker } from "../components/PlacePicker.jsx";
import { Toast } from "../components/ui/Toast.jsx";
import { useAuthContext } from "../context/AuthContext.jsx";
import { resolveHomeLocation, validateSettings } from "../utils/profileUpdate.js";
import { defaultUnits } from "../weather/units.js";

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
  const [location, setLocation] = useState(() => resolveHomeLocation(profile));
  const [units, setUnits] = useState(profile?.units || defaultUnits());
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    Boolean(profile?.notificationsEnabled),
  );
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!profile || hydratedRef.current) {
      return;
    }
    setDisplayName(profile.displayName || "");
    setLocation(resolveHomeLocation(profile));
    setUnits(profile.units || defaultUnits());
    setNotificationsEnabled(Boolean(profile.notificationsEnabled));
    hydratedRef.current = true;
  }, [profile]);

  async function handleSubmit(event) {
    event.preventDefault();
    const check = validateSettings({ preferredLocation: location });
    if (!check.ok) {
      setSaved(false);
      setMessage(check.message);
      return;
    }

    setSaving(true);
    const result = await updateProfile({
      displayName,
      preferredLocation: location,
      units,
      notificationsEnabled,
    });
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
        <p className="lede">
          Drop a pin for home, then set units and notifications. Role stays admin-managed.
        </p>
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
          <PlacePicker location={location} onPinChange={setLocation} />
          <label htmlFor="temperature-unit">Temperature</label>
          <select
            id="temperature-unit"
            value={units.temperature}
            onChange={(event) => setUnits((current) => ({ ...current, temperature: event.target.value }))}
          >
            <option value="C">Celsius</option>
            <option value="F">Fahrenheit</option>
          </select>
          <label htmlFor="wind-unit">Wind speed</label>
          <select
            id="wind-unit"
            value={units.wind}
            onChange={(event) => setUnits((current) => ({ ...current, wind: event.target.value }))}
          >
            <option value="kmh">km/h</option>
            <option value="ms">m/s</option>
            <option value="mph">mph</option>
          </select>
          <label htmlFor="clock-unit">Clock</label>
          <select
            id="clock-unit"
            value={units.clock}
            onChange={(event) => setUnits((current) => ({ ...current, clock: event.target.value }))}
          >
            <option value="12h">12-hour</option>
            <option value="24h">24-hour</option>
          </select>
          <label className="checkbox-field" htmlFor="notifications-enabled">
            <input
              id="notifications-enabled"
              type="checkbox"
              checked={notificationsEnabled}
              onChange={async (event) => {
                const enabled = event.target.checked;
                if (
                  enabled &&
                  typeof Notification !== "undefined" &&
                  Notification.permission === "default" &&
                  typeof Notification.requestPermission === "function"
                ) {
                  await Notification.requestPermission();
                }
                setNotificationsEnabled(enabled);
              }}
            />
            Notifications
          </label>
          <Toast message={message} tone="error" />
          {saved ? <p className="banner">Settings saved.</p> : null}
          <button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </button>
        </form>
      </article>
    </section>
  );
}
