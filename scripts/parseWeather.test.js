import { describe, expect, it } from "vitest";
import { parseWeather } from "./parseWeather.js";

const samplePayload = {
  name: "Pune",
  main: { temp: 29.7, humidity: 58 },
  wind: { speed: 2.4 },
  weather: [{ description: "scattered clouds", icon: "03d" }],
};

describe("parseWeather", () => {
  it("maps an OpenWeather current-weather payload to a Firestore reading", () => {
    const fetchedAt = new Date("2026-09-12T09:00:00.000Z");
    const reading = parseWeather(samplePayload, fetchedAt);

    expect(reading).toEqual({
      city: "Pune",
      temperature: 29.7,
      humidity: 58,
      windSpeed: 2.4,
      condition: "scattered clouds",
      icon: "03d",
      fetchedAt,
    });
  });

  it("throws when the payload is missing", () => {
    expect(() => parseWeather(null)).toThrow(/Invalid weather payload/);
  });

  it("throws when temperature is missing or not a number", () => {
    expect(() =>
      parseWeather({ ...samplePayload, main: { humidity: 50 } }),
    ).toThrow(/temperature/);
    expect(() =>
      parseWeather({ ...samplePayload, main: { temp: "warm", humidity: 50 } }),
    ).toThrow(/temperature/);
  });

  it("throws when weather[0] is missing", () => {
    expect(() => parseWeather({ ...samplePayload, weather: [] })).toThrow(
      /condition/,
    );
  });

  it("defaults optional numeric fields instead of writing garbage", () => {
    const reading = parseWeather({
      name: "Pune",
      main: { temp: 21 },
      weather: [{ description: "mist" }],
    });

    expect(reading.humidity).toBe(0);
    expect(reading.windSpeed).toBe(0);
    expect(reading.icon).toBe("");
  });
});
