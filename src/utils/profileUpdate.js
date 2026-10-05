import { DEFAULT_HOME, isValidCoords, toLocationId } from "../weather/locationId.js";
import { defaultUnits } from "../weather/units.js";

export function resolveHomeLocation(profile) {
  const saved = profile?.preferredLocation;
  if (isValidCoords(saved?.lat, saved?.lon)) {
    return {
      locationId: saved.locationId || toLocationId(saved.lat, saved.lon),
      label: saved.label || DEFAULT_HOME.label,
      lat: saved.lat,
      lon: saved.lon,
      ...(saved.timezone ? { timezone: saved.timezone } : {}),
    };
  }

  const legacyLabel = String(profile?.preferredCity || "").trim();
  return {
    ...DEFAULT_HOME,
    label: legacyLabel || DEFAULT_HOME.label,
  };
}

export function validateSettings({ preferredLocation }) {
  if (!isValidCoords(preferredLocation?.lat, preferredLocation?.lon)) {
    return { ok: false, message: "Drop a pin on the map to set your home location." };
  }
  return { ok: true };
}

export function buildSafeProfileUpdate(input) {
  const location = resolveHomeLocation({ preferredLocation: input?.preferredLocation });
  const units = input?.units || defaultUnits();
  return {
    displayName: String(input?.displayName || "").trim(),
    preferredLocation: {
      locationId: toLocationId(location.lat, location.lon),
      label: String(location.label || DEFAULT_HOME.label).trim() || DEFAULT_HOME.label,
      lat: location.lat,
      lon: location.lon,
      timezone: String(location.timezone || ""),
    },
    units: {
      temperature: units.temperature === "F" ? "F" : "C",
      wind: units.wind === "ms" || units.wind === "mph" ? units.wind : "kmh",
      clock: units.clock === "24h" ? "24h" : "12h",
    },
    notificationsEnabled: Boolean(input?.notificationsEnabled),
  };
}
