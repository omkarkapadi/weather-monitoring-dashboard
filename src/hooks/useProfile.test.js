import { describe, expect, it } from "vitest";
import { buildNewProfile } from "./useProfile.js";

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
