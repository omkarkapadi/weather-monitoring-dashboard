import { describe, expect, it } from "vitest";
import { mapReadingForDisplay, mapReadingsForChart } from "./weatherMappers.js";

describe("mapReadingForDisplay", () => {
  it("formats a complete reading for the current-conditions card", () => {
    const display = mapReadingForDisplay({
      city: "Pune",
      temperature: 28.4,
      humidity: 61,
      windSpeed: 3.2,
      condition: "clear sky",
      fetchedAt: new Date("2026-09-12T08:30:00.000Z"),
    });

    expect(display.city).toBe("Pune");
    expect(display.temperature).toBe("28°C");
    expect(display.humidity).toBe("61%");
    expect(display.windSpeed).toBe("3.2 m/s");
    expect(display.condition).toBe("clear sky");
    expect(display.fetchedAtLabel).toMatch(/2026|08:30|2:00|1:30/);
  });

  it("returns safe fallbacks when the reading is missing", () => {
    const display = mapReadingForDisplay(null);

    expect(display.city).toBe("—");
    expect(display.temperature).toBe("—");
    expect(display.humidity).toBe("—");
    expect(display.windSpeed).toBe("—");
    expect(display.condition).toBe("No data yet");
    expect(display.fetchedAtLabel).toBe("");
  });

  it("does not crash when numeric fields are missing", () => {
    const display = mapReadingForDisplay({ city: "Pune", condition: "haze" });

    expect(display.city).toBe("Pune");
    expect(display.temperature).toBe("—");
    expect(display.humidity).toBe("—");
    expect(display.windSpeed).toBe("—");
    expect(display.condition).toBe("haze");
  });
});

describe("mapReadingsForChart", () => {
  it("maps readings oldest-first for a time series", () => {
    const points = mapReadingsForChart([
      { temperature: 30, fetchedAt: new Date("2026-09-12T10:00:00.000Z") },
      { temperature: 27, fetchedAt: new Date("2026-09-12T09:00:00.000Z") },
    ]);

    expect(points).toHaveLength(2);
    expect(points[0].temperature).toBe(27);
    expect(points[1].temperature).toBe(30);
    expect(points[0].time).toBeTruthy();
    expect(points[1].time).toBeTruthy();
  });

  it("skips entries without a numeric temperature", () => {
    expect(
      mapReadingsForChart([
        { temperature: 20, fetchedAt: new Date("2026-09-12T09:00:00.000Z") },
        { temperature: "hot", fetchedAt: new Date("2026-09-12T10:00:00.000Z") },
      ]),
    ).toHaveLength(1);
  });

  it("returns an empty list for missing input", () => {
    expect(mapReadingsForChart(null)).toEqual([]);
  });

  it("accepts Firestore Timestamp-like fetchedAt values", () => {
    const display = mapReadingForDisplay({
      city: "Pune",
      temperature: 22,
      humidity: 40,
      windSpeed: 1,
      condition: "fog",
      fetchedAt: { toDate: () => new Date("2026-09-12T08:30:00.000Z") },
    });

    expect(display.fetchedAtLabel).toBeTruthy();
  });

  it("renders an empty chart time when fetchedAt is invalid", () => {
    const points = mapReadingsForChart([{ temperature: 20, fetchedAt: "not-a-date" }]);
    expect(points).toEqual([{ time: "", temperature: 20 }]);
  });
});

