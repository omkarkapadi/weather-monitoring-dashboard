import { toSelectedLocation } from "./selectedLocation.js";

export const SAVED_PLACE_LIMIT = 20;

export function toActiveLocation(place) {
  return toSelectedLocation({
    label: place?.label,
    lat: place?.lat,
    lon: place?.lon,
  });
}

export function canAddSavedPlace(count) {
  return Number(count) < SAVED_PLACE_LIMIT;
}

export function historyPlaceOptions(home, places) {
  const options = [];
  const seen = new Set();

  function add(place) {
    const next = place?.locationId ? place : toActiveLocation(place);
    if (!next?.locationId || seen.has(next.locationId)) {
      return;
    }
    seen.add(next.locationId);
    options.push(next);
  }

  add(home);
  for (const place of places || []) {
    add(place);
  }
  return options;
}

export function buildSavedPlace(location) {
  return {
    label: String(location?.label || "").trim(),
    lat: location?.lat,
    lon: location?.lon,
  };
}
