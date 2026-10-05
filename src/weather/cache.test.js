import { afterEach, describe, expect, it, vi } from "vitest";
import { FORECAST_TTL_MS, GEOCODE_TTL_MS, WeatherCache } from "./cache.js";

describe("WeatherCache", () => {
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("returns a fresh in-memory value", () => {
    const cache = new WeatherCache({ storage: localStorage, now: () => 1_000 });
    cache.set("forecast:pune", { temp: 30 }, FORECAST_TTL_MS);
    expect(cache.get("forecast:pune")).toEqual({ temp: 30 });
  });

  it("expires after the TTL", () => {
    let now = 1_000;
    const cache = new WeatherCache({ storage: localStorage, now: () => now });
    cache.set("forecast:pune", { temp: 30 }, FORECAST_TTL_MS);
    now += FORECAST_TTL_MS + 1;
    expect(cache.get("forecast:pune")).toBeNull();
  });

  it("rehydrates from localStorage", () => {
    const first = new WeatherCache({ storage: localStorage, now: () => 1_000 });
    first.set("forecast:pune", { temp: 31 }, FORECAST_TTL_MS);
    const second = new WeatherCache({ storage: localStorage, now: () => 2_000 });
    expect(second.get("forecast:pune")).toEqual({ temp: 31 });
  });

  it("uses a shorter TTL for geocode than forecast", () => {
    expect(GEOCODE_TTL_MS).toBeLessThan(FORECAST_TTL_MS);
    expect(FORECAST_TTL_MS).toBe(10 * 60 * 1000);
  });
});
