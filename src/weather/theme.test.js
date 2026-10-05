import { describe, expect, it } from "vitest";
import { resolveTheme } from "./theme.js";

describe("resolveTheme", () => {
  it("honors an explicit light or dark choice", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("follows the system when set to system", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});
