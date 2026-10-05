import { describe, expect, it, vi } from "vitest";
import { WeatherCache } from "../weather/cache.js";
import { DEFAULT_HOME } from "../weather/locationId.js";
import { loadWeather, shouldRefresh, weatherCacheKey } from "./useWeather.js";

function jsonResponse(payload) {
  return {
    ok: true,
    json: async () => payload,
  };
}

const forecastPayload = {
  timezone: "Asia/Kolkata",
  current: {
    time: "2026-10-05T12:19",
    temperature_2m: 30,
    apparent_temperature: 34,
    weather_code: 1,
    is_day: 1,
    relative_humidity_2m: 42,
    wind_speed_10m: 3.33,
    wind_direction_10m: 67,
    wind_gusts_10m: 5,
    pressure_msl: 1012,
    visibility: 10000,
    uv_index: 7,
    dew_point_2m: 16,
    cloud_cover: 18,
    precipitation_probability: 8,
  },
  hourly: {
    time: ["2026-10-05T12:00"],
    temperature_2m: [30],
    precipitation_probability: [8],
    wind_speed_10m: [3.33],
    weather_code: [1],
  },
  daily: {
    time: ["2026-10-05"],
    temperature_2m_max: [33],
    temperature_2m_min: [20],
    weather_code: [1],
    sunrise: ["2026-10-05T06:21"],
    sunset: ["2026-10-05T18:20"],
    precipitation_probability_max: [10],
  },
};

const airPayload = {
  current: { us_aqi: 46, european_aqi: 30, pm2_5: 12, pm10: 20 },
};

describe("weatherCacheKey", () => {
  it("scopes forecast and air quality by locationId", () => {
    expect(weatherCacheKey("forecast", "18.52,73.86")).toBe("om:forecast:18.52,73.86");
    expect(weatherCacheKey("aq", "18.52,73.86")).toBe("om:aq:18.52,73.86");
  });
});

describe("shouldRefresh", () => {
  it("refreshes every 10 minutes only while the tab is visible", () => {
    expect(shouldRefresh(0, 10 * 60 * 1000, true)).toBe(true);
    expect(shouldRefresh(0, 10 * 60 * 1000 - 1, true)).toBe(false);
    expect(shouldRefresh(0, 20 * 60 * 1000, false)).toBe(false);
  });
});

describe("loadWeather", () => {
  it("fetches forecast and air quality, then serves the cache", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(forecastPayload))
      .mockResolvedValueOnce(jsonResponse(airPayload));
    const cache = new WeatherCache({ storage: null, now: () => 1_000 });

    const first = await loadWeather({ location: DEFAULT_HOME, cache, fetchFn });
    expect(first.ok).toBe(true);
    expect(first.forecast.current.temperature).toBe(30);
    expect(first.air.usAqi).toBe(46);
    expect(first.fromCache).toBe(false);
    expect(fetchFn).toHaveBeenCalledTimes(2);

    const second = await loadWeather({ location: DEFAULT_HOME, cache, fetchFn });
    expect(second.fromCache).toBe(true);
    expect(second.forecast.current.temperature).toBe(30);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("maps 429 and missing pins to honest errors", async () => {
    const missing = await loadWeather({
      location: { label: "Nowhere" },
      cache: new WeatherCache({ storage: null }),
      fetchFn: vi.fn(),
    });
    expect(missing.ok).toBe(false);
    expect(missing.message).toMatch(/pin/i);

    const fetchFn = vi.fn().mockResolvedValue({ ok: false, status: 429 });
    const limited = await loadWeather({
      location: DEFAULT_HOME,
      cache: new WeatherCache({ storage: null }),
      fetchFn,
    });
    expect(limited.ok).toBe(false);
    expect(limited.message).toMatch(/too many requests/i);
  });
});
