import { describe, expect, it } from "vitest";
import { canQueryReadings, readingsErrorMessage } from "./useReadings.js";

describe("canQueryReadings", () => {
  it("waits until a city is chosen", () => {
    expect(canQueryReadings(true, "")).toBe(false);
    expect(canQueryReadings(true, "Pune")).toBe(true);
    expect(canQueryReadings(false, "Pune")).toBe(false);
  });
});

describe("readingsErrorMessage", () => {
  it("explains a missing composite index", () => {
    expect(readingsErrorMessage({ code: "failed-precondition" })).toMatch(/index/i);
  });
});
