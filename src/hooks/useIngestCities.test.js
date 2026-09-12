import { describe, expect, it } from "vitest";
import { mapIngestCities } from "./useIngestCities.js";

describe("mapIngestCities", () => {
  it("returns sorted unique city names from ingest status docs", () => {
    expect(
      mapIngestCities([{ city: "Pune" }, { city: "Mumbai" }, { city: "Pune" }, { city: "  " }]),
    ).toEqual(["Mumbai", "Pune"]);
  });
});
