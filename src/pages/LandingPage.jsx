import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <main className="landing">
      <section className="landing-card">
        <p className="eyebrow">Cloud Computing PBL</p>
        <h1>Weather Monitoring Dashboard</h1>
        <p className="lede">
          Live and historical weather for an approved team, stored in the cloud and
          refreshed on a schedule.
        </p>
        <Link className="button-link" to="/login">
          Sign in
        </Link>
      </section>
    </main>
  );
}
