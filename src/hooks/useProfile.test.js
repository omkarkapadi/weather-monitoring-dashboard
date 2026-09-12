import { describe, expect, it, vi } from "vitest";
import { applyProfileUpdate, buildNewProfile } from "./useProfile.js";

describe("buildNewProfile", () => {
  it("always creates the profile as a member so clients cannot self-promote", () => {
    expect(
      buildNewProfile({ email: "Omkar.Kapadi@MITWPU.edu.in", displayName: "Omkar" }, "Pune"),
    ).toEqual({
      email: "omkar.kapadi@mitwpu.edu.in",
      displayName: "Omkar",
      role: "member",
      preferredCity: "Pune",
      notificationsEnabled: false,
    });
  });
});

describe("applyProfileUpdate", () => {
  it("writes only display fields and never role", async () => {
    const writeUpdate = vi.fn().mockResolvedValue();
    const result = await applyProfileUpdate(writeUpdate, {
      displayName: "Omkar",
      preferredCity: "Mumbai",
      role: "admin",
    });

    expect(result).toEqual({ ok: true });
    expect(writeUpdate).toHaveBeenCalledWith({
      displayName: "Omkar",
      preferredCity: "Mumbai",
    });
  });

  it("does not write when the city is blank", async () => {
    const writeUpdate = vi.fn();
    const result = await applyProfileUpdate(writeUpdate, {
      displayName: "Omkar",
      preferredCity: " ",
    });

    expect(result.ok).toBe(false);
    expect(writeUpdate).not.toHaveBeenCalled();
  });
});
