import { describe, expect, it } from "vitest";
import { mapAuthError } from "./authErrors.js";

describe("mapAuthError", () => {
  it("maps known Firebase codes to student-friendly text", () => {
    expect(mapAuthError({ code: "auth/invalid-credential" })).toMatch(/incorrect/i);
    expect(mapAuthError({ code: "auth/email-already-in-use" })).toMatch(/already has an account/i);
    expect(mapAuthError({ code: "app/not-approved" })).toMatch(/approved list/i);
  });

  it("does not leak unknown Firebase messages to the UI", () => {
    expect(mapAuthError({ code: "auth/network-request-failed", message: "INTERNAL" })).toBe(
      "Something went wrong. Try again.",
    );
  });
});
