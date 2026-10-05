const STORM_CODES = new Set([95, 96, 99]);

export function evaluateAlerts({ temperatureC, weatherCode, usAqi }) {
  const alerts = [];

  if (typeof temperatureC === "number" && temperatureC > 40) {
    alerts.push({ id: "heat", message: "Extreme heat: temperature is above 40°C." });
  }
  if (typeof temperatureC === "number" && temperatureC < 5) {
    alerts.push({ id: "cold", message: "Extreme cold: temperature is below 5°C." });
  }
  if (STORM_CODES.has(weatherCode)) {
    alerts.push({ id: "storm", message: "Thunderstorm conditions in the forecast." });
  }
  if (typeof usAqi === "number" && usAqi >= 151) {
    alerts.push({ id: "aqi", message: "Poor air quality. Limit outdoor time." });
  }

  return alerts;
}
