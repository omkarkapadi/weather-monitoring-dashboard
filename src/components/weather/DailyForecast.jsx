import { Card } from "../ui/Card.jsx";

export function DailyForecast({ days }) {
  return (
    <Card className="daily-card">
      <p className="eyebrow">Outlook</p>
      <h2>Daily forecast</h2>
      <ol className="daily-list">
        {days.map((day) => (
          <li key={`${day.heading}-${day.dateLabel}`}>
            <div className="daily-day">
              <strong>{day.heading}</strong>
              <span>{day.dateLabel}</span>
            </div>
            <span className="daily-icon" aria-hidden="true">
              {day.icon}
            </span>
            <span className="daily-temps">
              <strong>{day.high}</strong>
              <span>{day.low}</span>
            </span>
            <span className="daily-condition">{day.condition}</span>
            <span className="daily-precip">{day.precip}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
