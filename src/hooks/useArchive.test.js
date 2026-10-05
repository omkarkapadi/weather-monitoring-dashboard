import { describe, expect, it, vi } from "vitest";
import { WeatherCache } from "../weather/cache.js";
import { DEFAULT_HOME } from "../weather/locationId.js";
import { loadArchive } from "./useArchive.js";

function jsonResponse(payload) {
  return {
    ok: true,
    json: async () => payload,
  };
}

const archivePayload = {
  timezone: "Asia/Kolkata",
  daily: {
    time: ["2026-09-27", "2026-09-28"],
    temperature_2m_max: [31.2, 32],
    temperature_2m_min: [22.1, 21],
    precipitation_sum: [0, 4.6],
  },
};

describe("loadArchive", () => {
  it("normalizes and caches archive days for the selected range", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(archivePayload));
    const cache = new WeatherCache({ storage: null, now: () => 1_000 });
    const range = { start: "2026-09-27", end: "2026-09-28" };

    const first = await loadArchive({
      location: DEFAULT_HOME,
      range,
      cache,
      fetchFn,
      now: new Date("2026-10-05T12:00:00Z"),
    });
    expect(first.ok).toBe(true);
    expect(first.days).toEqual([
      { date: "2026-09-27", high: 31.2, low: 22.1, precipitation: 0 },
      { date: "2026-09-28", high: 32, low: 21, precipitation: 4.6 },
    ]);
    expect(first.fromCache).toBe(false);

    const second = await loadArchive({
      location: DEFAULT_HOME,
      range,
      cache,
      fetchFn,
      now: new Date("2026-10-05T12:00:00Z"),
    });
    expect(second.fromCache).toBe(true);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn.mock.calls[0][0]).toContain("archive-api");
  });

  it("does not fetch an inverted range", async () => {
    const fetchFn = vi.fn();
    const result = await loadArchive({
      location: DEFAULT_HOME,
      range: { start: "2026-10-03", end: "2026-10-01" },
      cache: new WeatherCache({ storage: null }),
      fetchFn,
      now: new Date("2026-10-05T12:00:00Z"),
    });
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/start date/i);
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
