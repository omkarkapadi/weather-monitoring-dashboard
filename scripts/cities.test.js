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

  it("ignores the fallback city when profiles already have preferred cities", () => {
    expect(listDistinctCities([{ preferredCity: "Mumbai" }], "Pune")).toEqual(["Mumbai"]);
  });

  it("prefers the home pin label over the legacy preferred city", () => {
    expect(
      listDistinctCities([
        {
          preferredCity: "Mumbai",
          preferredLocation: { label: "Kasba Peth, Pune" },
        },
      ]),
    ).toEqual(["Kasba Peth, Pune"]);
  });

  it("caps unique ingest cities at 10 in alphabetical order", () => {
    const profiles = [
      "Ahmedabad",
      "Bengaluru",
      "Chennai",
      "Delhi",
      "Hyderabad",
      "Jaipur",
      "Kolkata",
      "Lucknow",
      "Mumbai",
      "Nagpur",
      "Pune",
    ].map((label) => ({ preferredLocation: { label } }));

    expect(listDistinctCities(profiles)).toEqual([
      "Ahmedabad",
      "Bengaluru",
      "Chennai",
      "Delhi",
      "Hyderabad",
      "Jaipur",
      "Kolkata",
      "Lucknow",
      "Mumbai",
      "Nagpur",
    ]);
  });
});

describe("cityDocId", () => {
  it("uses a stable lowercase id for ingestStatus docs", () => {
    expect(cityDocId("New York")).toBe("new-york");
    expect(cityDocId("Pune")).toBe("pune");
  });
});
