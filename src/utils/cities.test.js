import { describe, expect, it } from "vitest";
import {
  buildSafeProfileUpdate,
  mergeCityOptions,
  resolveSelectedCity,
  selectedCityOrDefault,
  validateSettings,
} from "./cities.js";

describe("selectedCityOrDefault", () => {
  it("prefers the user's saved city", () => {
    expect(selectedCityOrDefault("Mumbai")).toBe("Mumbai");
  });

  it("falls back when the profile city is empty", () => {
    expect(selectedCityOrDefault("  ", "Pune")).toBe("Pune");
  });
});

describe("mergeCityOptions", () => {
  it("includes the preferred city even when ingest has no data yet", () => {
    expect(mergeCityOptions("Pune", [])).toEqual(["Pune"]);
  });

  it("merges ingest cities with the preferred city without duplicates", () => {
    expect(mergeCityOptions("Pune", ["Mumbai", "Pune"])).toEqual(["Mumbai", "Pune"]);
  });
});

describe("resolveSelectedCity", () => {
  it("uses ingest spelling when the preferred city differs only by case", () => {
    expect(resolveSelectedCity("pune", ["Pune", "Mumbai"])).toBe("Pune");
  });

  it("keeps a preferred city that ingest has not stored yet", () => {
    expect(resolveSelectedCity("Nashik", ["Pune"])).toBe("Nashik");
  });
});

describe("buildSafeProfileUpdate", () => {
  it("never includes role or email so a member cannot self-promote", () => {
    expect(
      buildSafeProfileUpdate({
        displayName: "Omkar",
        preferredCity: "Mumbai",
        role: "admin",
        email: "attacker@college.edu",
      }),
    ).toEqual({
      displayName: "Omkar",
      preferredCity: "Mumbai",
    });
  });

  it("rejects a blank city", () => {
    expect(validateSettings({ displayName: "Omkar", preferredCity: " " })).toEqual({
      ok: false,
      message: "Enter a preferred city.",
    });
  });
});
