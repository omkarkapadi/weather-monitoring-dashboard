import { describe, expect, it } from "vitest";
import {
  buildSavedPlace,
  canAddSavedPlace,
  historyPlaceOptions,
  SAVED_PLACE_LIMIT,
  toActiveLocation,
} from "./savedPlaces.js";

describe("canAddSavedPlace", () => {
  it("caps saved places at 20", () => {
    expect(SAVED_PLACE_LIMIT).toBe(20);
    expect(canAddSavedPlace(19)).toBe(true);
    expect(canAddSavedPlace(20)).toBe(false);
  });
});

describe("toActiveLocation", () => {
  it("turns a saved place into the dashboard selection", () => {
    expect(
      toActiveLocation({
        id: "18.51,73.81",
        label: "Kothrud",
        lat: 18.51,
        lon: 73.81,
        addedAt: "stamp",
      }),
    ).toEqual({
      locationId: "18.51,73.81",
      label: "Kothrud",
      lat: 18.51,
      lon: 73.81,
    });
  });
});

describe("historyPlaceOptions", () => {
  it("lists home once, then other saved places", () => {
    const home = { locationId: "18.52,73.86", label: "Pune", lat: 18.52, lon: 73.86 };
    expect(
      historyPlaceOptions(home, [
        { id: "18.52,73.86", label: "Pune", lat: 18.52, lon: 73.86 },
        { id: "18.51,73.81", label: "Kothrud", lat: 18.51, lon: 73.81 },
      ]),
    ).toEqual([
      home,
      { locationId: "18.51,73.81", label: "Kothrud", lat: 18.51, lon: 73.81 },
    ]);
  });
});

describe("buildSavedPlace", () => {
  it("stores label and coordinates only", () => {
    expect(
      buildSavedPlace({
        label: "Kasba Peth, Pune",
        lat: 18.51,
        lon: 73.86,
        role: "admin",
      }),
    ).toEqual({
      label: "Kasba Peth, Pune",
      lat: 18.51,
      lon: 73.86,
    });
  });
});
