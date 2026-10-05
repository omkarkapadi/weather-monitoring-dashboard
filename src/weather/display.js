import { dailyHeading, formatLocalClock, formatLocalDay } from "./formatTime.js";
import { convertTemperature, convertWind } from "./units.js";
import { mapWmo } from "./wmo.js";

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

const EMOJI = {
  "clear-day": "☀️",
  "clear-night": "🌙",
  "cloudy-day": "⛅",
  "cloudy-night": "☁️",
  "fog-day": "🌫️",
  "fog-night": "🌫️",
  "drizzle-day": "🌦️",
  "drizzle-night": "🌦️",
  "rain-day": "🌧️",
  "rain-night": "🌧️",
  "snow-day": "❄️",
  "snow-night": "❄️",
  "storm-day": "⛈️",
  "storm-night": "⛈️",
};

export function compassFromDegrees(degrees) {
  if (!Number.isFinite(degrees)) {
    return "";
  }
  return COMPASS[Math.round(degrees / 45) % 8];
}

export function rateUsAqi(value) {
  if (!Number.isFinite(value)) {
    return { label: "Unknown", level: "unknown" };
  }
  if (value <= 50) {
    return { label: "Good", level: "good" };
  }
  if (value <= 100) {
    return { label: "Moderate", level: "moderate" };
  }
  if (value <= 150) {
    return { label: "Unhealthy for sensitive groups", level: "sensitive" };
  }
  if (value <= 200) {
    return { label: "Unhealthy", level: "unhealthy" };
  }
  if (value <= 300) {
    return { label: "Very unhealthy", level: "very-unhealthy" };
  }
  return { label: "Hazardous", level: "hazardous" };
}

export function wmoEmoji(iconKey) {
  return EMOJI[iconKey] || "☁️";
}

export function formatTemp(celsius, unit = "C") {
  if (!Number.isFinite(celsius)) {
    return "—";
  }
  return `${Math.round(convertTemperature(celsius, unit))}°`;
}

export function formatWind(metresPerSecond, unit = "kmh") {
  if (!Number.isFinite(metresPerSecond)) {
    return "—";
  }
  const suffix = unit === "ms" ? "m/s" : unit === "mph" ? "mph" : "km/h";
  return `${Math.round(convertWind(metresPerSecond, unit))} ${suffix}`;
}

export function formatVisibility(metres) {
  if (!Number.isFinite(metres)) {
    return "—";
  }
  return `${(metres / 1000).toFixed(1)} km`;
}

export function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return "—";
  }
  return `${Math.round(value)}%`;
}

export function sliceUpcomingHours(hourly, nowIso, count = 24) {
  const nowKey = String(nowIso || "").slice(0, 13);
  const start = hourly.findIndex((row) => String(row.time).slice(0, 13) >= nowKey);
  const from = start < 0 ? 0 : start;
  return hourly.slice(from, from + count);
}

export function buildHeroView({ location, forecast, air, units }) {
  const current = forecast?.current || {};
  const today = forecast?.daily?.[0] || {};
  const mapped = mapWmo(current.weatherCode, current.isDay);
  const clock = units?.clock || "12h";
  const wind = formatWind(current.windSpeed, units?.wind);
  const direction = compassFromDegrees(current.windDirection);

  return {
    place: location?.label || "Selected place",
    temperature: formatTemp(current.temperature, units?.temperature),
    feelsLike: formatTemp(current.feelsLike, units?.temperature),
    high: formatTemp(today.high, units?.temperature),
    low: formatTemp(today.low, units?.temperature),
    condition: mapped.text,
    visual: mapped.visual,
    icon: wmoEmoji(mapped.icon),
    humidity: formatPercent(current.humidity),
    wind: direction ? `${wind} ${direction}` : wind,
    gust: formatWind(current.windGusts, units?.wind),
    pressure: Number.isFinite(current.pressure) ? `${Math.round(current.pressure)} hPa` : "—",
    visibility: formatVisibility(current.visibility),
    uvIndex: Number.isFinite(current.uvIndex) ? String(Math.round(current.uvIndex)) : "—",
    dewPoint: formatTemp(current.dewPoint, units?.temperature),
    cloudCover: formatPercent(current.cloudCover),
    precip: formatPercent(current.precipitationProbability),
    sunrise: formatLocalClock(today.sunrise, clock),
    sunset: formatLocalClock(today.sunset, clock),
    updatedAt: current.time ? `Updated at ${formatLocalClock(current.time, clock)}` : "",
    aqi: {
      value: Number.isFinite(air?.usAqi) ? String(Math.round(air.usAqi)) : "—",
      label: rateUsAqi(air?.usAqi).label,
    },
  };
}

export function buildHourlyView(hourly, units, nowIso, count = 24) {
  const clock = units?.clock || "12h";
  return sliceUpcomingHours(hourly || [], nowIso, count).map((row) => {
    const mapped = mapWmo(row.weatherCode, 1);
    return {
      timeLabel: formatLocalClock(row.time, clock),
      temperature: formatTemp(row.temperature, units?.temperature),
      precip: formatPercent(row.precipitationProbability),
      icon: wmoEmoji(mapped.icon),
      wind: formatWind(row.windSpeed, units?.wind),
      condition: mapped.text,
    };
  });
}

export function buildDailyView(daily, todayIso, units) {
  return (daily || []).map((row) => {
    const mapped = mapWmo(row.weatherCode, 1);
    const day = formatLocalDay(row.date);
    return {
      heading: dailyHeading(row.date, todayIso),
      dateLabel: day.monthDay,
      high: formatTemp(row.high, units?.temperature),
      low: formatTemp(row.low, units?.temperature),
      precip: formatPercent(row.precipitationProbability),
      icon: wmoEmoji(mapped.icon),
      condition: mapped.text,
    };
  });
}

export function buildArchiveView(days, units) {
  return (days || []).map((day) => ({
    date: day.date,
    high: formatTemp(day.high, units?.temperature),
    low: formatTemp(day.low, units?.temperature),
    precipitation: Number.isFinite(day.precipitation) ? `${day.precipitation.toFixed(1)} mm` : "—",
    highValue: Number.isFinite(day.high) ? convertTemperature(day.high, units?.temperature) : null,
    lowValue: Number.isFinite(day.low) ? convertTemperature(day.low, units?.temperature) : null,
    precipValue: Number.isFinite(day.precipitation) ? day.precipitation : null,
  }));
}

export function buildChartPoints(hourly, units, nowIso) {
  return buildHourlyView(hourly, units, nowIso, 48).map((row) => ({
    time: row.timeLabel,
    temperature: Number.parseInt(row.temperature, 10),
    precip: Number.parseInt(row.precip, 10),
    wind: Number.parseInt(row.wind, 10),
  }));
}
