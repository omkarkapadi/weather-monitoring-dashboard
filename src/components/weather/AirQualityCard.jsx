import { Card } from "../ui/Card.jsx";
import { Stat } from "../ui/Stat.jsx";

export function AirQualityCard({ air }) {
  return (
    <Card className={`aq-card is-${air.rating?.level || "unknown"}`}>
      <p className="eyebrow">Air</p>
      <h2>Air quality</h2>
      <p className="aq-score">{air.usAqi ?? "—"}</p>
      <p className="lede">{air.rating?.label || "Unknown"}</p>
      <dl className="weather-hero-metrics">
        <Stat label="European AQI" value={air.europeanAqi ?? "—"} />
        <Stat label="PM2.5" value={air.pm25 ?? "—"} />
        <Stat label="PM10" value={air.pm10 ?? "—"} />
      </dl>
    </Card>
  );
}
