import { mapReadingForDisplay } from "../utils/weatherMappers.js";

export function CurrentWeather({ reading }) {
  const display = mapReadingForDisplay(reading);

  return (
    <article className="weather-card">
      <p className="eyebrow">Current conditions</p>
      <h2>{display.city}</h2>
      <p className="temperature">{display.temperature}</p>
      <p className="condition">{display.condition}</p>
      <dl className="metrics">
        <div>
          <dt>Humidity</dt>
          <dd>{display.humidity}</dd>
        </div>
        <div>
          <dt>Wind</dt>
          <dd>{display.windSpeed}</dd>
        </div>
      </dl>
      {display.fetchedAtLabel ? (
        <p className="meta">Updated {display.fetchedAtLabel}</p>
      ) : null}
    </article>
  );
}
