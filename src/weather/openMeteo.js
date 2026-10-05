const CURRENT =
  "temperature_2m,apparent_temperature,weather_code,is_day,relative_humidity_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl,visibility,uv_index,dew_point_2m,cloud_cover,precipitation_probability";
const HOURLY = "temperature_2m,precipitation_probability,wind_speed_10m,weather_code";
const DAILY =
  "temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset,precipitation_probability_max";

export function buildForecastUrl({ lat, lon }) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: "auto",
    wind_speed_unit: "ms",
    forecast_days: "16",
    current: CURRENT,
    hourly: HOURLY,
    daily: DAILY,
  });
  return `https://api.open-meteo.com/v1/forecast?${params}`;
}

export function buildGeocodeUrl(name) {
  const params = new URLSearchParams({
    name: String(name || "").trim(),
    count: "8",
    language: "en",
    format: "json",
  });
  return `https://geocoding-api.open-meteo.com/v1/search?${params}`;
}

export function buildNominatimUrl(name) {
  const params = new URLSearchParams({
    q: String(name || "").trim(),
    format: "jsonv2",
    limit: "8",
  });
  return `https://nominatim.openstreetmap.org/search?${params}`;
}

export function buildAirQualityUrl({ lat, lon }) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: "auto",
    current: "us_aqi,european_aqi,pm2_5,pm10",
  });
  return `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`;
}

export function buildArchiveUrl({ lat, lon, start, end }) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    start_date: start,
    end_date: end,
    timezone: "auto",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
  });
  return `https://archive-api.open-meteo.com/v1/archive?${params}`;
}

export function formatNominatimResult(result) {
  return {
    label: String(result?.display_name || "").trim(),
    lat: Number(result?.lat),
    lon: Number(result?.lon),
  };
}

export function formatGeocodeResult(result) {
  const parts = [result?.name, result?.admin2, result?.admin1, result?.country]
    .filter(Boolean)
    .filter(
      (part, index, all) =>
        all.findIndex((item) => String(item).toLowerCase() === String(part).toLowerCase()) === index,
    );
  return {
    label: parts.join(", "),
    lat: Number(result?.latitude),
    lon: Number(result?.longitude),
  };
}

export function normalizeForecast(payload) {
  const hourlyTimes = payload?.hourly?.time || [];
  const dailyTimes = payload?.daily?.time || [];

  return {
    timezone: payload?.timezone || "UTC",
    current: {
      time: payload?.current?.time,
      temperature: payload?.current?.temperature_2m,
      feelsLike: payload?.current?.apparent_temperature,
      weatherCode: payload?.current?.weather_code,
      isDay: payload?.current?.is_day,
      humidity: payload?.current?.relative_humidity_2m,
      windSpeed: payload?.current?.wind_speed_10m,
      windDirection: payload?.current?.wind_direction_10m,
      windGusts: payload?.current?.wind_gusts_10m,
      pressure: payload?.current?.pressure_msl,
      visibility: payload?.current?.visibility,
      uvIndex: payload?.current?.uv_index,
      dewPoint: payload?.current?.dew_point_2m,
      cloudCover: payload?.current?.cloud_cover,
      precipitationProbability: payload?.current?.precipitation_probability,
    },
    hourly: hourlyTimes.map((time, index) => ({
      time,
      temperature: payload.hourly.temperature_2m?.[index],
      precipitationProbability: payload.hourly.precipitation_probability?.[index],
      windSpeed: payload.hourly.wind_speed_10m?.[index],
      weatherCode: payload.hourly.weather_code?.[index],
    })),
    daily: dailyTimes.map((time, index) => ({
      date: time,
      high: payload.daily.temperature_2m_max?.[index],
      low: payload.daily.temperature_2m_min?.[index],
      weatherCode: payload.daily.weather_code?.[index],
      sunrise: payload.daily.sunrise?.[index],
      sunset: payload.daily.sunset?.[index],
      precipitationProbability: payload.daily.precipitation_probability_max?.[index],
    })),
  };
}

export function normalizeAirQuality(payload) {
  return {
    usAqi: payload?.current?.us_aqi,
    europeanAqi: payload?.current?.european_aqi,
    pm25: payload?.current?.pm2_5,
    pm10: payload?.current?.pm10,
  };
}
