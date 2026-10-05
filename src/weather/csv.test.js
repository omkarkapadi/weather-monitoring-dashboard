import { describe, expect, it, vi } from "vitest";
import { buildCsv, csvFileName, downloadCsv } from "./csv.js";

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

describe("downloadCsv", () => {
  it("names the file from the place and the shown range", () => {
    expect(csvFileName("Kasba Peth, Pune", "2026-09-27", "2026-10-03")).toBe(
      "weather-kasba-peth-pune-2026-09-27-to-2026-10-03.csv",
    );
  });

  it("clicks a temporary download link for the shown CSV", () => {
    const click = vi.fn();
    const remove = vi.fn();
    const link = { href: "", download: "", click, remove };
    const documentRef = {
      createElement: vi.fn(() => link),
      body: { appendChild: vi.fn() },
    };
    const createObjectURL = vi.fn(() => "blob:history");
    const revokeObjectURL = vi.fn();

    downloadCsv("date,high\n2026-09-27,31", "weather.csv", {
      createObjectURL,
      revokeObjectURL,
      documentRef,
    });

    expect(link.download).toBe("weather.csv");
    expect(link.href).toBe("blob:history");
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:history");
  });
});

