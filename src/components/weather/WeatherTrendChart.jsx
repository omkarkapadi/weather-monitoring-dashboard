import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../ui/Card.jsx";

export default function WeatherTrendChart({ points }) {
  return (
    <Card className="chart-card">
      <p className="eyebrow">Trends</p>
      <h2>Next 48 hours</h2>
      {points.length === 0 ? (
        <p className="empty">No hourly points yet for this pin.</p>
      ) : (
        <div className="chart-frame">
          <table className="visually-hidden">
            <caption>Next 48 hours</caption>
            <thead>
              <tr>
                <th>Time</th>
                <th>Temperature</th>
                <th>Rain chance</th>
                <th>Wind</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.time}>
                  <td>{point.time}</td>
                  <td>{point.temperature}</td>
                  <td>{point.precip}</td>
                  <td>{point.wind}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            className="chart-graphic"
            role="img"
            aria-label="Temperature, rain chance, and wind over the next 48 hours"
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={points} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: "currentColor", fontSize: 12 }} />
                <YAxis tick={{ fill: "currentColor", fontSize: 12 }} width={40} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    background: "var(--panel)",
                    border: "1px solid var(--line)",
                    borderRadius: "8px",
                    color: "var(--ink)",
                  }}
                />
                <Line type="monotone" dataKey="temperature" stroke="var(--accent)" strokeWidth={2.5} dot={false} name="Temp" />
                <Line type="monotone" dataKey="precip" stroke="#8fb7ff" strokeWidth={2} dot={false} name="Rain %" />
                <Line type="monotone" dataKey="wind" stroke="#d4c07a" strokeWidth={2} dot={false} name="Wind" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  );
}
