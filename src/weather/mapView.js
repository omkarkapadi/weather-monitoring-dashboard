export const CITY_MAP_ZOOM = 10;

export function shouldResetCityZoom(fromLat, fromLon, toLat, toLon, thresholdKm = 3) {
  if (![fromLat, fromLon, toLat, toLon].every(Number.isFinite)) {
    return true;
  }
  const km = Math.hypot(fromLat - toLat, fromLon - toLon) * 111;
  return km >= thresholdKm;
}

export function nextMapZoom({ jumped, currentZoom, cityZoom = CITY_MAP_ZOOM }) {
  return jumped ? cityZoom : currentZoom;
}
