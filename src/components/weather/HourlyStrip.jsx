import { Card } from "../ui/Card.jsx";

export function HourlyStrip({ hours }) {
  return (
    <Card className="hourly-card">
      <p className="eyebrow">Next hours</p>
      <h2>Hourly forecast</h2>
      <ol className="hourly-strip" tabIndex={0} aria-label="Hourly forecast, scroll horizontally">
        {hours.map((hour, index) => (
          <li key={`${hour.timeLabel}-${index}`}>
            <p className="hourly-time">{hour.timeLabel}</p>
            <p className="hourly-icon" aria-hidden="true">
              {hour.icon}
            </p>
            <p className="visually-hidden">{hour.condition}</p>
            <p className="hourly-temp">{hour.temperature}</p>
            <p className="hourly-precip">{hour.precip}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
