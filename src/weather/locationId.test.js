import { describe, expect, it } from "vitest";
import { DEFAULT_HOME, isValidCoords, parseLocationId, toLocationId } from "./locationId.js";

describe("toLocationId", () => {
  it("rounds lat/lon to two decimals for about 1 km cells", () => {
    expect(toLocationId(18.5204, 73.8567)).toBe("18.52,73.86");
  });

  it("keeps a minus sign on southern and western coordinates", () => {
    expect(toLocationId(-33.8688, -151.2093)).toBe("-33.87,-151.21");
  });
});

describe("parseLocationId", () => {
  it("reads a locationId back into numbers", () => {
    expect(parseLocationId("18.52,73.86")).toEqual({ lat: 18.52, lon: 73.86 });
  });
});

describe("isValidCoords", () => {
  it("rejects NaN and out-of-range values", () => {
    expect(isValidCoords(18.52, 73.86)).toBe(true);
    expect(isValidCoords(Number.NaN, 73.86)).toBe(false);
    expect(isValidCoords(91, 73.86)).toBe(false);
  });
});

describe("DEFAULT_HOME", () => {
  it("is Pune at the locked coordinates", () => {
    expect(DEFAULT_HOME).toEqual({
      locationId: "18.52,73.86",
      label: "Pune",
      lat: 18.52,
      lon: 73.86,
    });
  });
});
