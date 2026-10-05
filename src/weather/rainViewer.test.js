import { describe, expect, it, vi } from "vitest";
import { WeatherCache } from "./cache.js";
import {
  RAINVIEWER_MAPS_URL,
  RADAR_TTL_MS,
  buildRadarTileUrl,
  formatRadarTime,
  loadRadarMaps,
  nextFrameIndex,
  normalizeRadarFrames,
  radarSummary,
} from "./rainViewer.js";

const SAMPLE = {
  host: "https://tilecache.rainviewer.com",
  radar: {
    past: [
      { time: 1720000000, path: "/v2/radar/1720000000" },
      { time: 1720000300, path: "/v2/radar/1720000300" },
    ],
    nowcast: [{ time: 1720000600, path: "/v2/radar/1720000600" }],
  },
};

describe("normalizeRadarFrames", () => {
  it("joins past and nowcast frames and keeps the latest observed index", () => {
    const next = normalizeRadarFrames(SAMPLE);
    expect(next.host).toBe("https://tilecache.rainviewer.com");
    expect(next.frames).toHaveLength(3);
    expect(next.latestPastIndex).toBe(1);
    expect(next.frames[1].path).toBe("/v2/radar/1720000300");
  });

  it("returns an empty list when the payload is missing", () => {
    expect(normalizeRadarFrames(null)).toEqual({ host: "", frames: [], latestPastIndex: 0 });
  });
});

describe("buildRadarTileUrl", () => {
  it("uses the host and path from weather-maps.json", () => {
    expect(
      buildRadarTileUrl({
        host: "https://tilecache.rainviewer.com",
        path: "/v2/radar/1720000300",
      }),
    ).toBe("https://tilecache.rainviewer.com/v2/radar/1720000300/256/{z}/{x}/{y}/2/1_1.png");
  });
});

describe("radarSummary", () => {
  it("describes the current frame for a text alternative", () => {
    const { frames } = normalizeRadarFrames(SAMPLE);
    expect(radarSummary({ frames, index: 1, playing: false })).toMatch(/2 of 3/);
    expect(radarSummary({ frames, index: 1, playing: true })).toMatch(/playing/i);
    expect(radarSummary({ frames: [], index: 0 })).toMatch(/no radar/i);
  });
});

describe("formatRadarTime and nextFrameIndex", () => {
  it("formats unix seconds in a fixed zone", () => {
    expect(formatRadarTime(1720000300, { clock: "24h", timeZone: "UTC" })).toMatch(/UTC/);
  });

  it("wraps the playhead", () => {
    expect(nextFrameIndex(2, 3)).toBe(0);
    expect(nextFrameIndex(0, 0)).toBe(0);
  });
});

describe("loadRadarMaps", () => {
  it("caches weather-maps.json", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => SAMPLE,
    });
    const cache = new WeatherCache({ storage: null });

    const first = await loadRadarMaps({ cache, fetchFn });
    const second = await loadRadarMaps({ cache, fetchFn });

    expect(first.ok).toBe(true);
    expect(first.frames).toHaveLength(3);
    expect(second.fromCache).toBe(true);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn.mock.calls[0][0]).toBe(RAINVIEWER_MAPS_URL);
    expect(RADAR_TTL_MS).toBe(5 * 60 * 1000);
  });
});
