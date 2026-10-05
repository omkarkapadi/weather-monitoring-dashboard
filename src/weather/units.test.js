import { describe, expect, it } from "vitest";
import { convertTemperature, convertWind, defaultUnits } from "./units.js";

describe("defaultUnits", () => {
  it("defaults to C, km/h, and 12-hour clock", () => {
    expect(defaultUnits()).toEqual({
      temperature: "C",
      wind: "kmh",
      clock: "12h",
    });
  });
});

describe("convertTemperature", () => {
  it("leaves Celsius unchanged", () => {
    expect(convertTemperature(30, "C")).toBe(30);
  });

  it("converts to Fahrenheit", () => {
    expect(convertTemperature(0, "F")).toBe(32);
    expect(convertTemperature(30, "F")).toBe(86);
  });
});

describe("convertWind", () => {
  it("converts metres per second to km/h by default", () => {
    expect(convertWind(10, "kmh")).toBe(36);
  });

  it("can keep m/s or convert to mph", () => {
    expect(convertWind(10, "ms")).toBe(10);
    expect(convertWind(10, "mph")).toBeCloseTo(22.369, 2);
  });
});
