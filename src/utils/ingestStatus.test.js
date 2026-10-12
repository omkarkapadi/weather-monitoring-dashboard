import { describe, expect, it } from "vitest";
import { formatIngestTime, ingestHealth, mapIngestStatus } from "./ingestStatus.js";

describe("mapIngestStatus", () => {
  it("normalizes, drops blank cities, and sorts by name", () => {
    const success = new Date("2026-10-12T04:00:00.000Z");
    expect(
      mapIngestStatus([
        { id: "pune", city: "Pune", lastSuccessAt: success, lastError: null },
        { id: "blank", city: "  ", lastError: "ignored" },
        {
          id: "mumbai",
          city: "Mumbai",
          lastSuccessAt: { toDate: () => new Date("2026-10-11T10:00:00.000Z") },
          lastError: "OpenWeather request failed: 401",
        },
      ]),
    ).toEqual([
      {
        id: "mumbai",
        city: "Mumbai",
        lastSuccessAt: new Date("2026-10-11T10:00:00.000Z"),
        lastError: "OpenWeather request failed: 401",
      },
      {
        id: "pune",
        city: "Pune",
        lastSuccessAt: success,
        lastError: null,
      },
    ]);
  });
});

describe("ingestHealth", () => {
  it("marks error, ok, and unknown rows", () => {
    expect(ingestHealth({ lastError: "boom", lastSuccessAt: new Date() })).toBe("error");
    expect(ingestHealth({ lastError: null, lastSuccessAt: new Date() })).toBe("ok");
    expect(ingestHealth({ lastError: null, lastSuccessAt: null })).toBe("unknown");
  });
});

describe("formatIngestTime", () => {
  it("formats dates and falls back when missing", () => {
    expect(formatIngestTime(null)).toBe("Never");
    expect(formatIngestTime(new Date("2026-10-12T04:00:00.000Z"))).not.toBe("Never");
  });
});
