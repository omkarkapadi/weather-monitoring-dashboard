import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../ui/Card.jsx";

export default function ArchiveChart({ rows }) {
  return (
    <Card className="chart-card">
      <p className="eyebrow">Archive</p>
      <h2>Temperature and rain</h2>
      {rows.length === 0 ? (
        <p className="empty">No archive days in this range.</p>
      ) : (
        <div className="chart-frame">
          <table className="visually-hidden">
            <caption>Daily high, low, and rainfall for the selected range</caption>
            <thead>
              <tr>
                <th>Date</th>
                <th>High</th>
                <th>Low</th>
                <th>Rain</th>
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
          <div className="chart-graphic" role="img" aria-label="Daily high, low, and rainfall for the selected range">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "currentColor", fontSize: 12 }} />
                <YAxis tick={{ fill: "currentColor", fontSize: 12 }} width={40} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    background: "var(--panel)",
                    border: "1px solid var(--line)",
                    borderRadius: "8px",
                    color: "var(--ink)",
                  }}
                />
                <Line type="monotone" dataKey="highValue" stroke="var(--accent)" strokeWidth={2.5} dot={false} name="High" />
                <Line type="monotone" dataKey="lowValue" stroke="#8fb7ff" strokeWidth={2} dot={false} name="Low" />
                <Line type="monotone" dataKey="precipValue" stroke="#d4c07a" strokeWidth={2} dot={false} name="Rain mm" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  );
}
