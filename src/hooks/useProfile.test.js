import { describe, expect, it, vi } from "vitest";
import { DEFAULT_HOME } from "../weather/locationId.js";
import { defaultUnits } from "../weather/units.js";
import { applyProfileUpdate, buildNewProfile } from "./useProfile.js";

describe("buildNewProfile", () => {
  it("always creates the profile as a member with Pune home and default units", () => {
    expect(
      buildNewProfile({ email: "Omkar.Kapadi@MITWPU.edu.in", displayName: "Omkar" }),
    ).toEqual({
      email: "omkar.kapadi@mitwpu.edu.in",
      displayName: "Omkar",
      role: "member",
      preferredLocation: DEFAULT_HOME,
      units: defaultUnits(),
      notificationsEnabled: false,
    });
  });
});

describe("applyProfileUpdate", () => {
  it("writes only display fields and never role", async () => {
    const writeUpdate = vi.fn().mockResolvedValue();
    const result = await applyProfileUpdate(writeUpdate, {
      displayName: "Omkar",
      preferredLocation: { ...DEFAULT_HOME, timezone: "Asia/Kolkata" },
      units: { temperature: "F", wind: "mph", clock: "24h" },
      notificationsEnabled: true,
      role: "admin",
    });

    expect(result).toEqual({ ok: true });
    expect(writeUpdate).toHaveBeenCalledWith({
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

  it("returns a permission error instead of throwing", async () => {
    const writeUpdate = vi.fn().mockRejectedValue({ code: "permission-denied" });
    const result = await applyProfileUpdate(writeUpdate, {
      displayName: "Omkar",
      preferredLocation: DEFAULT_HOME,
    });

    expect(result).toEqual({
      ok: false,
      message: "Permission denied. Deploy the latest Firestore rules, then try again.",
    });
  });

  it("does not write when the pin has no coordinates", async () => {
    const writeUpdate = vi.fn();
    const result = await applyProfileUpdate(writeUpdate, {
      displayName: "Omkar",
      preferredLocation: { label: "Pune" },
    });

    expect(result.ok).toBe(false);
    expect(writeUpdate).not.toHaveBeenCalled();
  });
});
