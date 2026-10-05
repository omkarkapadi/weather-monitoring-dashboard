import { describe, expect, it } from "vitest";
import { DEFAULT_HOME } from "../weather/locationId.js";
import { buildSafeProfileUpdate, resolveHomeLocation, validateSettings } from "./profileUpdate.js";

describe("buildSafeProfileUpdate", () => {
  it("never includes role or email", () => {
    expect(
      buildSafeProfileUpdate({
        displayName: "Omkar",
        preferredLocation: { ...DEFAULT_HOME, timezone: "Asia/Kolkata" },
        units: { temperature: "F", wind: "mph", clock: "24h" },
        notificationsEnabled: true,
        role: "admin",
        email: "attacker@college.edu",
      }),
    ).toEqual({
      displayName: "Omkar",
      preferredLocation: {
        locationId: "18.52,73.86",
        label: "Pune",
        lat: 18.52,
        lon: 73.86,
        timezone: "Asia/Kolkata",
      },
      units: { temperature: "F", wind: "mph", clock: "24h" },
      notificationsEnabled: true,
    });
  });
});

describe("validateSettings", () => {
  it("rejects a pin without coordinates", () => {
    expect(validateSettings({ preferredLocation: { label: "Pune" } })).toEqual({
      ok: false,
      message: "Drop a pin on the map to set your home location.",
    });
  });

  it("rejects NaN coordinates", () => {
    expect(validateSettings({ preferredLocation: { lat: Number.NaN, lon: 73.86 } }).ok).toBe(false);
  });
});

describe("resolveHomeLocation", () => {
  it("uses the saved preferred location", () => {
    const home = { ...DEFAULT_HOME, label: "Kasba Peth, Pune" };
    expect(resolveHomeLocation({ preferredLocation: home })).toEqual(home);
  });

  it("falls back to Pune when the profile has no location", () => {
    expect(resolveHomeLocation({ preferredCity: "Mumbai" })).toEqual({
      ...DEFAULT_HOME,
      label: "Mumbai",
    });
  });
});
