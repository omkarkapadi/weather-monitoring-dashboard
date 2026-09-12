import { describe, expect, it } from "vitest";
import { getNavItems, requireAuth, requireGuest } from "./routes.js";

describe("requireAuth", () => {
  it("stays on the current screen while auth is loading", () => {
    expect(requireAuth(undefined, true)).toEqual({
      status: "loading",
      redirectTo: null,
    });
  });

  it("sends signed-out users to /login", () => {
    expect(requireAuth(null, false)).toEqual({
      status: "unauthenticated",
      redirectTo: "/login",
    });
  });

  it("lets a signed-in user through", () => {
    expect(requireAuth({ uid: "u1" }, false)).toEqual({
      status: "authenticated",
      redirectTo: null,
    });
  });
});

describe("requireGuest", () => {
  it("sends signed-in users to /app", () => {
    expect(requireGuest({ uid: "u1" }, false)).toEqual({
      status: "authenticated",
      redirectTo: "/app",
    });
  });

  it("lets guests stay on public pages", () => {
    expect(requireGuest(null, false)).toEqual({
      status: "guest",
      redirectTo: null,
    });
  });
});

describe("getNavItems", () => {
  it("hides admin links for members and guests", () => {
    const paths = getNavItems("member").map((item) => item.to);
    expect(paths).toEqual(["/app", "/app/history", "/app/settings"]);
  });

  it("shows admin links only for the admin role", () => {
    const paths = getNavItems("admin").map((item) => item.to);
    expect(paths).toContain("/app/admin");
    expect(paths).toContain("/app/admin/status");
  });
});
