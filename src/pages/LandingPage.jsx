import { Link } from "react-router-dom";
import { AttributionFooter } from "../components/ui/AttributionFooter.jsx";

export function LandingPage() {
  return (
    <main className="landing">
      <section className="landing-hero landing-card">
        <p className="eyebrow">Cloud Computing PBL</p>
        <h1>Weather Monitoring Dashboard</h1>
        <p className="lede">
          Search any neighbourhood, drop a pin, and see current, hourly, and daily weather on
          demand. The live desk talks to Open-Meteo in the browser — it does not wait on a
          scheduler.
        </p>
        <Link className="button-link" to="/login">
          Sign in
        </Link>
      </section>

      <section className="landing-features" aria-label="Product highlights">
        <article className="landing-card">
          <h2>On-demand forecast</h2>
          <p>Current conditions, hourly strip, 16-day outlook, air quality, and a 48-hour trend.</p>
        </article>
        <article className="landing-card">
          <h2>Live map</h2>
          <p>Leaflet + OpenStreetMap with RainViewer radar, saved-place pins, and save-on-click.</p>
        </article>
        <article className="landing-card">
          <h2>History export</h2>
          <p>Open-Meteo archive for your home place, with a CSV of the rows on screen.</p>
        </article>
        <article className="landing-card">
          <h2>Invite-only access</h2>
          <p>Weather APIs are public. Login, approved emails, and rules protect the app and profiles.</p>
        </article>
      </section>

      <section className="landing-preview landing-card" aria-label="Dashboard preview">
        <p className="eyebrow">Preview</p>
        <div className="landing-mock" aria-hidden="true">
          <p className="landing-mock-place">Pune</p>
          <p className="landing-mock-temp">30°</p>
          <p>Mainly clear · High 33° · Low 20°</p>
        </div>
        <AttributionFooter />
      </section>
    </main>
  );
}
