export function selectedCityOrDefault(profileCity, fallback = "Pune") {
  return String(profileCity || "").trim() || fallback;
}

export function resolveSelectedCity(preferredCity, ingestCities, fallback = "Pune") {
  const preferred = String(preferredCity || "").trim();
  const cities = ingestCities || [];
  if (preferred) {
    const match = cities.find((city) => city.toLowerCase() === preferred.toLowerCase());
    return match || preferred;
  }
  return cities[0] || fallback;
}

export function mergeCityOptions(preferredCity, ingestCities) {
  const cities = new Set();
  const preferred = String(preferredCity || "").trim();
  if (preferred) {
    cities.add(preferred);
  }
  for (const city of ingestCities || []) {
    const name = String(city || "").trim();
    if (name) {
      cities.add(name);
    }
  }
  return [...cities].sort((left, right) => left.localeCompare(right));
}

export function validateSettings({ preferredCity }) {
  if (!String(preferredCity || "").trim()) {
    return { ok: false, message: "Enter a preferred city." };
  }
  return { ok: true };
}

export function buildSafeProfileUpdate(input) {
  return {
    displayName: String(input?.displayName || "").trim(),
    preferredCity: String(input?.preferredCity || "").trim(),
  };
}
