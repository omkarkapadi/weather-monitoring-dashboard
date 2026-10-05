import { describe, expect, it } from "vitest";
import {
  buildDailyView,
  buildHeroView,
  buildHourlyView,
  compassFromDegrees,
  formatTemp,
  formatVisibility,
  formatWind,
  rateUsAqi,
  sliceUpcomingHours,
  wmoEmoji,
} from "./display.js";

const units = { temperature: "C", wind: "kmh", clock: "12h" };

const forecast = {
  timezone: "Asia/Kolkata",
  current: {
    time: "2026-10-05T12:19",
    temperature: 30,
    feelsLike: 34,
    weatherCode: 1,
    isDay: 1,
    humidity: 42,
    windSpeed: 3.33,
    windDirection: 67,
    windGusts: 5.2,
    pressure: 1012,
    visibility: 10000,
    uvIndex: 7.4,
    dewPoint: 16,
    cloudCover: 18,
    precipitationProbability: 8,
  },
  hourly: [
    { time: "2026-10-05T11:00", temperature: 29, precipitationProbability: 10, windSpeed: 3, weatherCode: 2 },
    { time: "2026-10-05T12:00", temperature: 30, precipitationProbability: 8, windSpeed: 3.3, weatherCode: 1 },
    { time: "2026-10-05T13:00", temperature: 31, precipitationProbability: 5, windSpeed: 3.5, weatherCode: 1 },
  ],
  daily: [
    {
      date: "2026-10-05",
      high: 33,
      low: 20,
      weatherCode: 1,
      sunrise: "2026-10-05T06:21",
      sunset: "2026-10-05T18:20",
      precipitationProbability: 10,
    },
    {
      date: "2026-10-06",
      high: 32,
      low: 21,
      weatherCode: 2,
      sunrise: "2026-10-06T06:21",
      sunset: "2026-10-06T18:19",
      precipitationProbability: 20,
    },
  ],
};

describe("compassFromDegrees", () => {
  it("maps degrees onto eight compass points", () => {
    expect(compassFromDegrees(0)).toBe("N");
    expect(compassFromDegrees(67)).toBe("NE");
    expect(compassFromDegrees(270)).toBe("W");
  });
});

describe("rateUsAqi", () => {
  it("uses EPA-style bands", () => {
    expect(rateUsAqi(45)).toEqual({ label: "Good", level: "good" });
    expect(rateUsAqi(162)).toEqual({ label: "Unhealthy", level: "unhealthy" });
  });
});

describe("formatters", () => {
  it("rounds converted units for the dashboard", () => {
    expect(formatTemp(30.4, "C")).toBe("30°");
    expect(formatTemp(30, "F")).toBe("86°");
    expect(formatWind(3.33, "kmh")).toBe("12 km/h");
    expect(formatVisibility(10000)).toBe("10.0 km");
  });
});

describe("sliceUpcomingHours", () => {
  it("starts at the current local hour", () => {
    const next = sliceUpcomingHours(forecast.hourly, "2026-10-05T12:19", 2);
    expect(next.map((row) => row.time)).toEqual(["2026-10-05T12:00", "2026-10-05T13:00"]);
  });
});

describe("buildHeroView", () => {
  it("builds the AccuWeather-style current card from Open-Meteo fields", () => {
    const hero = buildHeroView({
      location: { label: "Pune" },
      forecast,
      air: { usAqi: 46, europeanAqi: 30, pm25: 12, pm10: 20 },
      units,
    });

    expect(hero.place).toBe("Pune");
    expect(hero.temperature).toBe("30°");
    expect(hero.feelsLike).toBe("34°");
    expect(hero.high).toBe("33°");
    expect(hero.low).toBe("20°");
    expect(hero.condition).toMatch(/mainly clear/i);
    expect(hero.visual).toBe("clear");
    expect(hero.icon).toBe(wmoEmoji("clear-day"));
    expect(hero.humidity).toBe("42%");
    expect(hero.wind).toMatch(/12 km\/h/);
    expect(hero.wind).toMatch(/NE/);
    expect(hero.updatedAt).toMatch(/12:19/);
    expect(hero.aqi.label).toBe("Good");
  });
});

describe("buildHourlyView / buildDailyView", () => {
  it("formats the hourly strip and daily list", () => {
    const hours = buildHourlyView(forecast.hourly, units, "2026-10-05T12:19", 2);
    expect(hours[0]).toMatchObject({
      timeLabel: "12:00 PM",
      temperature: "30°",
      precip: "8%",
      condition: "Mainly clear",
    });

    const days = buildDailyView(forecast.daily, "2026-10-05T12:19", units);
    expect(days[0].heading).toBe("Today");
    expect(days[0].high).toBe("33°");
    expect(days[0].low).toBe("20°");
    expect(days[1].heading).toMatch(/Tue/i);
  });
});
