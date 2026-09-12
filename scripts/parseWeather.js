export function parseWeather(payload, fetchedAt = new Date()) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid weather payload");
  }

  const temperature = payload.main?.temp;
  if (typeof temperature !== "number" || Number.isNaN(temperature)) {
    throw new Error("Missing or invalid temperature");
  }

  const condition = payload.weather?.[0]?.description;
  if (!condition) {
    throw new Error("Missing weather condition");
  }

  return {
    city: payload.name || "Unknown",
    temperature,
    humidity: typeof payload.main?.humidity === "number" ? payload.main.humidity : 0,
    windSpeed: typeof payload.wind?.speed === "number" ? payload.wind.speed : 0,
    condition,
    icon: payload.weather[0].icon || "",
    fetchedAt,
  };
}
