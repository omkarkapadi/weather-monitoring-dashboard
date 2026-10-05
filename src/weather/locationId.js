export function toLocationId(lat, lon) {
  return `${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`;
}

export function parseLocationId(locationId) {
  const [lat, lon] = String(locationId || "").split(",").map(Number);
  return { lat, lon };
}

export function isValidCoords(lat, lon) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

export const DEFAULT_HOME = {
  locationId: toLocationId(18.52, 73.86),
  label: "Pune",
  lat: 18.52,
  lon: 73.86,
};
