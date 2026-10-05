import { isValidCoords, toLocationId } from "../weather/locationId.js";

export function toSelectedLocation(next, previous) {
  const lat = Number(next?.lat ?? next?.latitude);
  const lon = Number(next?.lon ?? next?.longitude);
  if (!isValidCoords(lat, lon)) {
    return null;
  }

  const incomingLabel = String(next?.label || "").trim();
  const nextId = toLocationId(lat, lon);
  const previousId = isValidCoords(Number(previous?.lat), Number(previous?.lon))
    ? toLocationId(previous.lat, previous.lon)
    : "";
  const previousLabel = String(previous?.label || "").trim();
  const label = incomingLabel || (nextId === previousId ? previousLabel : "") || "Dropped pin";

  return {
    locationId: nextId,
    label,
    lat,
    lon,
  };
}
