import { describe, expect, it } from "vitest";
import { defaultArchiveRange, validateArchiveRange } from "./archiveRange.js";

describe("defaultArchiveRange", () => {
  it("ends two days ago and covers seven days", () => {
    expect(defaultArchiveRange(new Date("2026-10-05T12:00:00Z"))).toEqual({
      start: "2026-09-27",
      end: "2026-10-03",
    });
  });
});

describe("validateArchiveRange", () => {
  const now = new Date("2026-10-05T12:00:00Z");

  it("rejects an inverted or empty range", () => {
    expect(validateArchiveRange("", "2026-10-01", now).ok).toBe(false);
    expect(validateArchiveRange("2026-10-03", "2026-10-01", now).message).toMatch(/start date/i);
  });

  it("rejects a range longer than 366 days or ending in the future", () => {
    expect(validateArchiveRange("2025-01-01", "2026-10-03", now).message).toMatch(/366/);
    expect(validateArchiveRange("2026-10-01", "2026-10-06", now).message).toMatch(/yesterday/i);
  });

  it("accepts a week that is already in the archive", () => {
    expect(validateArchiveRange("2026-09-27", "2026-10-03", now)).toMatchObject({
      ok: true,
      days: 7,
    });
  });
});
