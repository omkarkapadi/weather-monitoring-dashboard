import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { mapReadingsForChart } from "../utils/weatherMappers.js";

export function WeatherChart({ readings }) {
  const points = mapReadingsForChart(readings);

  return (
    <article className="chart-card">
      <p className="eyebrow">Temperature trend</p>
      <h2>Recent readings</h2>
      {points.length === 0 ? (
        <p className="empty">No history yet. Run the GitHub Action once to store a reading.</p>
      ) : (
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={points} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: "#b7c4c1", fontSize: 12 }} />
              <YAxis
                unit="°"
                tick={{ fill: "#b7c4c1", fontSize: 12 }}
                width={40}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  background: "#102422",
                  border: "1px solid #2a4a46",
                  borderRadius: "8px",
                  color: "#f4f7f6",
                }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#7ad4c3"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#7ad4c3" }}
                name="Temperature (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}
