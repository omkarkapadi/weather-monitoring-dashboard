export const INGEST_CITY_CAP = 10;

export function cityDocId(city) {
  return String(city || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function profileIngestCity(profile) {
  const fromLocation = String(profile?.preferredLocation?.label || "").trim();
  if (fromLocation) {
    return fromLocation;
  }
  return String(profile?.preferredCity || "").trim();
}

export function listDistinctCities(profiles, fallback = "Pune") {
  const cities = new Set();
  for (const profile of profiles || []) {
    const city = profileIngestCity(profile);
    if (city) {
      cities.add(city);
    }
  }
  if (cities.size === 0 && fallback) {
    cities.add(fallback);
  }
  return [...cities].sort((left, right) => left.localeCompare(right)).slice(0, INGEST_CITY_CAP);
}
