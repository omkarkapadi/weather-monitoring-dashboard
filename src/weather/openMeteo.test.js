import { describe, expect, it } from "vitest";
import {
  buildAirQualityUrl,
  buildArchiveUrl,
  buildForecastUrl,
  buildGeocodeUrl,
  formatGeocodeResult,
  normalizeAirQuality,
  normalizeForecast,
} from "./openMeteo.js";

describe("Open-Meteo URLs", () => {
  it("requests forecast in the location timezone", () => {
    const url = buildForecastUrl({ lat: 18.52, lon: 73.86 });
    expect(url).toContain("latitude=18.52");
    expect(url).toContain("longitude=73.86");
    expect(url).toContain("timezone=auto");
    expect(url).toContain("current=");
    expect(url).toContain("hourly=");
    expect(url).toContain("daily=");
    expect(url).toContain("wind_speed_unit=ms");
    expect(url).toContain("forecast_days=16");
  });

  it("builds geocode, air-quality, and archive URLs", () => {
    expect(buildGeocodeUrl("Kasba Peth")).toMatch(/name=Kasba(\+|%20)Peth/);
    expect(buildAirQualityUrl({ lat: 18.52, lon: 73.86 })).toContain("air-quality-api");
    expect(buildArchiveUrl({ lat: 18.52, lon: 73.86, start: "2026-01-01", end: "2026-01-07" })).toContain(
      "archive-api",
    );
  });
});

describe("formatGeocodeResult", () => {
  it("joins name, region, and country", () => {
    expect(
      formatGeocodeResult({
        name: "Kasba Peth",
        admin1: "Maharashtra",
        country: "India",
        latitude: 18.51,
        longitude: 73.86,
      }),
    ).toEqual({
      label: "Kasba Peth, Maharashtra, India",
      lat: 18.51,
      lon: 73.86,
    });
  });

  it("coerces string coordinates so a search pick can update the pin", () => {
    expect(
      formatGeocodeResult({
        name: "Mumbai",
        admin1: "Maharashtra",
        country: "India",
        latitude: "19.076",
        longitude: "72.8777",
      }),
    ).toEqual({
      label: "Mumbai, Maharashtra, India",
      lat: 19.076,
      lon: 72.8777,
    });
  });

  it("includes the district so neighbourhood searches stay specific", () => {
    expect(
      formatGeocodeResult({
        name: "Kothrud",
        admin2: "Pune",
        admin1: "Maharashtra",
        country: "India",
        latitude: 18.51,
        longitude: 73.81,
      }),
    ).toEqual({
      label: "Kothrud, Pune, Maharashtra, India",
      lat: 18.51,
      lon: 73.81,
    });
  });
});

describe("normalizeForecast", () => {
  it("maps current, hourly, and daily blocks", () => {
    const weather = normalizeForecast({
      timezone: "Asia/Kolkata",
      current: {
        time: "2026-06-01T12:00",
        temperature_2m: 31.2,
        apparent_temperature: 33,
        weather_code: 1,
        is_day: 1,
        relative_humidity_2m: 55,
        wind_speed_10m: 3.2,
        wind_direction_10m: 70,
        wind_gusts_10m: 5.1,
        pressure_msl: 1011,
        visibility: 12000,
        uv_index: 8,
        dew_point_2m: 16.4,
        cloud_cover: 22,
        precipitation_probability: 8,
      },
      hourly: {
        time: ["2026-06-01T12:00", "2026-06-01T13:00"],
        temperature_2m: [31.2, 32],
        precipitation_probability: [10, 20],
        wind_speed_10m: [3.2, 4],
        weather_code: [1, 2],
      },
      daily: {
        time: ["2026-06-01"],
        temperature_2m_max: [34],
        temperature_2m_min: [24],
        weather_code: [1],
        sunrise: ["2026-06-01T06:00"],
        sunset: ["2026-06-01T19:05"],
        precipitation_probability_max: [15],
      },
    });

    expect(weather.timezone).toBe("Asia/Kolkata");
    expect(weather.current.temperature).toBe(31.2);
    expect(weather.current.windDirection).toBe(70);
    expect(weather.current.uvIndex).toBe(8);
    expect(weather.hourly).toHaveLength(2);
    expect(weather.hourly[0].weatherCode).toBe(1);
    expect(weather.daily[0].high).toBe(34);
    expect(weather.daily[0].low).toBe(24);
    expect(weather.daily[0].precipitationProbability).toBe(15);
  });
});

describe("normalizeAirQuality", () => {
  it("maps US and European AQI plus particulates", () => {
    expect(
      normalizeAirQuality({
        current: { us_aqi: 62, european_aqi: 41, pm2_5: 18.2, pm10: 31 },
      }),
    ).toEqual({
      usAqi: 62,
      europeanAqi: 41,
      pm25: 18.2,
      pm10: 31,
    });
  });
});
