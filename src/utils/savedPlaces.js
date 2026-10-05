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

export function buildSavedPlace(location) {
  return {
    label: String(location?.label || "").trim(),
    lat: location?.lat,
    lon: location?.lon,
  };
}
