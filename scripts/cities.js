export function cityDocId(city) {
  return String(city || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function listDistinctCities(profiles, fallback = "Pune") {
  const cities = new Set();
  for (const profile of profiles || []) {
    const city = String(profile?.preferredCity || "").trim();
    if (city) {
      cities.add(city);
    }
  }
  if (cities.size === 0 && fallback) {
    cities.add(fallback);
  }
  return [...cities].sort((left, right) => left.localeCompare(right));
}
