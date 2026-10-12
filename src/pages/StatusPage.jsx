import { CurrentWeather } from "../components/CurrentWeather.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { useIngestStatus } from "../hooks/useIngestStatus.js";
import { useReadings } from "../hooks/useReadings.js";
import { formatIngestTime, ingestHealth } from "../utils/ingestStatus.js";

export function StatusPage() {
  const { rows, status, error } = useIngestStatus(true);
  const city = rows[0]?.city || "Pune";
  const readings = useReadings(rows.length > 0, city);

  return (
    <section className="admin-grid">
      <article className="panel-card admin-card">
        <p className="eyebrow">Scheduled ingest</p>
        <h2>System status</h2>
        <p className="lede">
          GitHub Actions writes OpenWeather snapshots to Firestore for at most 10 distinct home
          places. This is the cloud job log, not the live Open-Meteo desk.
        </p>
        {status === "loading" ? <Skeleton lines={3} /> : null}
        {error ? (
          <p className="banner banner-error" role="alert">
            {error}
          </p>
        ) : null}
        {status === "ready" && rows.length === 0 ? (
          <p className="empty">
            No ingest runs yet. In GitHub open Actions → Fetch weather → Run workflow. That needs
            OPENWEATHER_API_KEY and the Firebase service account secret.
          </p>
        ) : null}
        {readings.latest ? <CurrentWeather reading={readings.latest} /> : null}
        {rows.length > 0 ? (
          <ul className="data-list">
            {rows.map((row) => (
              <li key={row.id}>
                <div>
                  <strong>{row.city}</strong>
                  <p className="meta">Last success: {formatIngestTime(row.lastSuccessAt)}</p>
                  {row.lastError ? <p className="meta">{row.lastError}</p> : null}
                </div>
                <span className="role-pill">{ingestHealth(row)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    </section>
  );
}
