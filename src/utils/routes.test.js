import { describe, expect, it } from "vitest";
import { getNavItems, requireAdmin, requireApprovedApp, requireAuth, requireGuest } from "./routes.js";

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

describe("requireApprovedApp", () => {
  it("waits until auth, invite, and profile are known", () => {
    expect(
      requireApprovedApp({
        user: { uid: "u1" },
        authLoading: false,
        approved: undefined,
        profile: undefined,
        profileLoading: true,
      }),
    ).toEqual({ status: "loading", redirectTo: null });
  });

  it("sends an unapproved signed-in user out of /app", () => {
    expect(
      requireApprovedApp({
        user: { uid: "u1" },
        authLoading: false,
        approved: false,
        profile: null,
        profileLoading: false,
      }),
    ).toEqual({ status: "forbidden", redirectTo: "/not-approved" });
  });

  it("lets an approved member with a profile through", () => {
    expect(
      requireApprovedApp({
        user: { uid: "u1" },
        authLoading: false,
        approved: true,
        profile: { role: "member" },
        profileLoading: false,
      }),
    ).toEqual({ status: "ok", redirectTo: null });
  });

  it("does not treat a lookup failure as an invite rejection", () => {
    expect(
      requireApprovedApp({
        user: { uid: "u1" },
        authLoading: false,
        approved: undefined,
        profile: undefined,
        profileLoading: false,
        accessError: true,
      }),
    ).toEqual({ status: "error", redirectTo: null });
  });
});

describe("requireGuest", () => {
  it("sends approved signed-in users to /app", () => {
    expect(requireGuest({ uid: "u1" }, false, true)).toEqual({
      status: "authenticated",
      redirectTo: "/app",
    });
  });

  it("does not bounce an unapproved signed-in user back into /app", () => {
    expect(requireGuest({ uid: "u1" }, false, false)).toEqual({
      status: "guest",
      redirectTo: null,
    });
  });

  it("lets guests stay on public pages", () => {
    expect(requireGuest(null, false)).toEqual({
      status: "guest",
      redirectTo: null,
    });
  });
});

describe("requireAdmin", () => {
  it("waits while the profile is still loading", () => {
    expect(requireAdmin("member", true)).toEqual({
      status: "loading",
      redirectTo: null,
    });
  });

  it("sends members to /app", () => {
    expect(requireAdmin("member", false)).toEqual({
      status: "forbidden",
      redirectTo: "/app",
    });
  });

  it("lets admins through", () => {
    expect(requireAdmin("admin", false)).toEqual({
      status: "ok",
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
