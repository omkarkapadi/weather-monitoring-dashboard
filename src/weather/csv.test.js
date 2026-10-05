import { describe, expect, it } from "vitest";
import { buildCsv } from "./csv.js";

describe("buildCsv", () => {
  it("builds a CSV for the rows currently on screen", () => {
    const csv = buildCsv(
      [
        { date: "2026-06-01", temperature: 30.4, precipitation: 1.2 },
        { date: "2026-06-02", temperature: 31, precipitation: 0 },
      ],
      ["date", "temperature", "precipitation"],
    );

    expect(csv).toBe("date,temperature,precipitation\n2026-06-01,30.4,1.2\n2026-06-02,31,0");
  });

  it("quotes commas in values", () => {
    expect(buildCsv([{ label: "Kasba Peth, Pune" }], ["label"])).toBe(
      'label\n"Kasba Peth, Pune"',
    );
  });
});
