import { describe, expect, it } from "vitest";
import { DEFAULT_HOME } from "../weather/locationId.js";
import { toSelectedLocation } from "./selectedLocation.js";

describe("toSelectedLocation", () => {
  it("turns a search result into the same selection the label and weather hook read", () => {
    expect(
      toSelectedLocation(
        {
          label: "Mumbai, Maharashtra, India",
          latitude: "19.076",
          longitude: "72.8777",
        },
        DEFAULT_HOME,
      ),
    ).toEqual({
      locationId: "19.08,72.88",
      label: "Mumbai, Maharashtra, India",
      lat: 19.076,
      lon: 72.8777,
    });
  });

  it("does not keep the previous city name when the pin moves to a new cell", () => {
    expect(
      toSelectedLocation({ lat: 19.07, lon: 72.88 }, DEFAULT_HOME),
    ).toEqual({
      locationId: "19.07,72.88",
      label: "Dropped pin",
      lat: 19.07,
      lon: 72.88,
    });
  });

  it("keeps the current name when only the pin is nudged inside the same cell", () => {
    expect(
      toSelectedLocation({ lat: 18.524, lon: 73.861 }, DEFAULT_HOME),
    ).toEqual({
      locationId: "18.52,73.86",
      label: "Pune",
      lat: 18.524,
      lon: 73.861,
    });
  });
});
