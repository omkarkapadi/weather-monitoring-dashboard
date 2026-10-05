import { describe, expect, it } from "vitest";
import { dailyHeading, formatClock, formatLocalClock, formatLocalDay } from "./formatTime.js";

describe("formatClock", () => {
  it("formats a time in the location timezone", () => {
    const iso = "2026-06-01T06:30:00+05:30";
    expect(formatClock(iso, "Asia/Kolkata", "24h")).toMatch(/06:30/);
  });

  it("uses a 12-hour clock when requested", () => {
    const iso = "2026-06-01T18:05:00+05:30";
    expect(formatClock(iso, "Asia/Kolkata", "12h")).toMatch(/6:05/i);
  });
});

describe("formatLocalClock", () => {
  it("reads Open-Meteo local timestamps without converting timezones", () => {
    expect(formatLocalClock("2026-10-05T13:00", "24h")).toBe("13:00");
    expect(formatLocalClock("2026-10-05T13:00", "12h")).toBe("1:00 PM");
  });
});

describe("dailyHeading", () => {
  it("labels the first forecast day as Today", () => {
    expect(dailyHeading("2026-10-05", "2026-10-05T12:19")).toBe("Today");
    expect(dailyHeading("2026-10-06", "2026-10-05T12:19")).toMatch(/Tue/i);
  });
});
