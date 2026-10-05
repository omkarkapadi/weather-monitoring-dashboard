import { describe, expect, it } from "vitest";
import { CITY_MAP_ZOOM, nextMapZoom, shouldResetCityZoom } from "./mapView.js";

describe("CITY_MAP_ZOOM", () => {
  it("starts at a city-wide view instead of a street", () => {
    expect(CITY_MAP_ZOOM).toBe(10);
  });
});

describe("shouldResetCityZoom", () => {
  it("treats a neighbourhood search as a jump and a pin drag as local", () => {
    expect(shouldResetCityZoom(18.52, 73.86, 18.51, 73.81)).toBe(true);
    expect(shouldResetCityZoom(18.52, 73.86, 18.521, 73.861)).toBe(false);
  });
});

describe("nextMapZoom", () => {
  it("opens jumps at city zoom and keeps the current zoom when dragging", () => {
    expect(nextMapZoom({ jumped: true, currentZoom: 15 })).toBe(CITY_MAP_ZOOM);
    expect(nextMapZoom({ jumped: false, currentZoom: 15 })).toBe(15);
  });
});
