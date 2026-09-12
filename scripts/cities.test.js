import { describe, expect, it } from "vitest";
import { cityDocId, listDistinctCities } from "./cities.js";

describe("listDistinctCities", () => {
  it("returns sorted unique preferred cities from profiles", () => {
    expect(
      listDistinctCities([
        { preferredCity: "Mumbai" },
        { preferredCity: "Pune" },
        { preferredCity: "Pune" },
        { preferredCity: "  " },
      ]),
    ).toEqual(["Mumbai", "Pune"]);
  });

  it("falls back to Pune when nobody has chosen a city", () => {
    expect(listDistinctCities([])).toEqual(["Pune"]);
    expect(listDistinctCities(null, "Delhi")).toEqual(["Delhi"]);
  });
});

describe("cityDocId", () => {
  it("uses a stable lowercase id for ingestStatus docs", () => {
    expect(cityDocId("New York")).toBe("new-york");
    expect(cityDocId("Pune")).toBe("pune");
  });
});
