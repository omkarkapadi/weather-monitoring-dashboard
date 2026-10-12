import { lazy, Suspense, useState } from "react";
import { Skeleton } from "../components/Skeleton.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { useAuthContext } from "../context/AuthContext.jsx";
import { useArchive } from "../hooks/useArchive.js";
import { useSavedPlaces } from "../hooks/useSavedPlaces.js";
import { resolveHomeLocation } from "../utils/profileUpdate.js";
import { historyPlaceOptions } from "../utils/savedPlaces.js";
import { defaultArchiveRange, validateArchiveRange } from "../weather/archiveRange.js";
import { ARCHIVE_CSV_COLUMNS, buildCsv, csvFileName, downloadCsv } from "../weather/csv.js";
import { buildArchiveView } from "../weather/display.js";
import { defaultUnits } from "../weather/units.js";

const ArchiveChart = lazy(() => import("../components/weather/ArchiveChart.jsx"));

export function HistoryPage() {
  const { user, profile } = useAuthContext();
  const home = resolveHomeLocation(profile);
  const saved = useSavedPlaces(user?.uid);
  const places = historyPlaceOptions(home, saved.places);
  const [locationId, setLocationId] = useState(home.locationId);
  const location = places.find((place) => place.locationId === locationId) || home;
  const units = profile?.units || defaultUnits();
  const defaults = defaultArchiveRange();
  const [draft, setDraft] = useState(defaults);
  const [range, setRange] = useState(defaults);
  const [formError, setFormError] = useState("");
  const archive = useArchive(location, range, { enabled: Boolean(profile) });
  const rows = buildArchiveView(archive.days, units);

  function applyRange(event) {
    event.preventDefault();
    const checked = validateArchiveRange(draft.start, draft.end);
    if (!checked.ok) {
      setFormError(checked.message);
      return;
    }
    setFormError("");
    setRange({ start: checked.start, end: checked.end });
  }

  function exportCsv() {
    const csv = buildCsv(
      rows.map((row) => ({
        date: row.date,
        high: row.high,
        low: row.low,
        precipitation: row.precipitation,
        place: location.label,
      })),
      ARCHIVE_CSV_COLUMNS,
    );
    downloadCsv(csv, csvFileName(location.label, archive.range.start, archive.range.end));
  }

  return (
    <section className="history-board">
      <article className="panel-card history-card">
        <p className="eyebrow">Archive</p>
        <h2>History</h2>
        <p className="meta">
          Daily highs, lows, and rainfall for {location.label} from the Open-Meteo archive. Pick home
          or a saved place.
        </p>
        <form className="history-range" onSubmit={applyRange}>
          <label htmlFor="history-place">
            Place
            <select
              id="history-place"
              value={location.locationId}
              onChange={(event) => setLocationId(event.target.value)}
            >
              {places.map((place) => (
                <option key={place.locationId} value={place.locationId}>
                  {place.locationId === home.locationId ? `${place.label} (home)` : place.label}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="history-start">
            Start date
            <input
              id="history-start"
              type="date"
              value={draft.start}
              onChange={(event) => setDraft((current) => ({ ...current, start: event.target.value }))}
            />
          </label>
          <label htmlFor="history-end">
            End date
            <input
              id="history-end"
              type="date"
              value={draft.end}
              onChange={(event) => setDraft((current) => ({ ...current, end: event.target.value }))}
            />
          </label>
          <button type="submit">Apply range</button>
        </form>
        {formError ? (
          <p className="banner banner-error" role="alert">
            {formError}
          </p>
        ) : null}
        {archive.error ? (
          <p className="banner banner-error" role="alert">
            {archive.error}
          </p>
        ) : null}

        {archive.status === "loading" ? <Skeleton lines={5} /> : null}

        {archive.status === "ready" && rows.length === 0 ? (
          <EmptyState title="No archive days" body="Try a shorter range that ends at least two days ago." />
        ) : null}

        {archive.status === "ready" && rows.length > 0 ? (
          <>
            <Suspense fallback={<article className="ui-card"><Skeleton lines={4} /></article>}>
              <ArchiveChart rows={rows} />
            </Suspense>
            <div className="history-table-wrap">
              <table className="history-table">
                <caption className="visually-hidden">
                  Daily high, low, and rainfall for {location.label}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">High</th>
                    <th scope="col">Low</th>
                    <th scope="col">Rain</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.date}>
                      <td>{row.date}</td>
                      <td>{row.high}</td>
                      <td>{row.low}</td>
                      <td>{row.precipitation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={exportCsv}>
              Download CSV
            </button>
          </>
        ) : null}
      </article>
    </section>
  );
}

export default HistoryPage;
