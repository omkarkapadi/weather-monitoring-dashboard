import { describe, expect, it } from "vitest";
import { mapWmo } from "./wmo.js";

describe("mapWmo", () => {
  it("maps clear sky by day", () => {
    expect(mapWmo(0, 1)).toMatchObject({
      text: "Clear sky",
      icon: "clear-day",
      visual: "clear",
    });
  });

  it("uses a night variant and night visual after sunset", () => {
    expect(mapWmo(0, 0)).toMatchObject({
      icon: "clear-night",
      visual: "night",
    });
  });

  it("maps thunderstorm codes to storm", () => {
    expect(mapWmo(95, 1)).toMatchObject({
      text: "Thunderstorm",
      visual: "storm",
    });
  });

  it("maps rain to the rain visual", () => {
    expect(mapWmo(61, 1).visual).toBe("rain");
  });

  it("falls back for an unknown code", () => {
    expect(mapWmo(999, 1)).toMatchObject({
      text: "Unknown conditions",
      visual: "cloudy",
      icon: "cloudy-day",
    });
  });
});
