function toDate(value) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value.toDate === "function") {
    return value.toDate();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatTemperature(value) {
  return typeof value === "number" ? `${Math.round(value)}°C` : "—";
}

function formatHumidity(value) {
  return typeof value === "number" ? `${value}%` : "—";
}

function formatWind(value) {
  return typeof value === "number" ? `${value} m/s` : "—";
}

function formatFetchedAt(value) {
  const date = toDate(value);
  return date ? date.toLocaleString() : "";
}

function formatChartTime(value) {
  const date = toDate(value);
  if (!date) {
    return "";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function mapReadingForDisplay(reading) {
  if (!reading) {
    return {
      city: "—",
      temperature: "—",
      humidity: "—",
      windSpeed: "—",
      condition: "No data yet",
      fetchedAtLabel: "",
    };
  }

  return {
    city: reading.city || "—",
    temperature: formatTemperature(reading.temperature),
    humidity: formatHumidity(reading.humidity),
    windSpeed: formatWind(reading.windSpeed),
    condition: reading.condition || "Unknown",
    fetchedAtLabel: formatFetchedAt(reading.fetchedAt),
  };
}

export function mapReadingsForChart(readings) {
  if (!Array.isArray(readings)) {
    return [];
  }

  return readings
    .filter((reading) => typeof reading?.temperature === "number")
    .slice()
    .sort((left, right) => {
      const leftTime = toDate(left.fetchedAt)?.getTime() ?? 0;
      const rightTime = toDate(right.fetchedAt)?.getTime() ?? 0;
      return leftTime - rightTime;
    })
    .map((reading) => ({
      time: formatChartTime(reading.fetchedAt),
      temperature: reading.temperature,
    }));
}
