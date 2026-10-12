import { describe, expect, it, vi } from "vitest";
import {
  canRevokeInvite,
  ensureEmailApproved,
  isAdmin,
  isApproved,
  canChangeUserRole,
  matchingProfileIds,
  normalizeEmail,
  validateApprovedEmailInput,
} from "./accessControl.js";

describe("normalizeEmail", () => {
  it("trims and lowercases emails for document IDs", () => {
    expect(normalizeEmail("  Omkar.Kapadi@MITWPU.edu.in ")).toBe(
      "omkar.kapadi@mitwpu.edu.in",
    );
  });
});

describe("isAdmin", () => {
  it("is true only for the admin role", () => {
    expect(isAdmin("admin")).toBe(true);
    expect(isAdmin("member")).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});

describe("isApproved", () => {
  it("treats a missing approvedEmails doc as rejected", () => {
    expect(isApproved(true)).toBe(true);
    expect(isApproved(false)).toBe(false);
  });
});

describe("validateApprovedEmailInput", () => {
  it("rejects empty or incomplete emails", () => {
    expect(validateApprovedEmailInput("")).toEqual({
      ok: false,
      message: "Enter an email address.",
    });
    expect(validateApprovedEmailInput("not-an-email")).toEqual({
      ok: false,
      message: "Enter a valid email address.",
    });
  });

  it("normalizes a valid invite email", () => {
    expect(validateApprovedEmailInput("  Teammate@College.edu ")).toEqual({
      ok: true,
      email: "teammate@college.edu",
    });
  });
});

describe("ensureEmailApproved", () => {
  it("returns the invite doc when the email is approved", async () => {
    const getApprovedDoc = vi.fn().mockResolvedValue({
      exists: () => true,
      data: () => ({ email: "member@college.edu", role: "member" }),
    });

    const invite = await ensureEmailApproved(getApprovedDoc, "Member@college.edu");
    expect(getApprovedDoc).toHaveBeenCalledWith("member@college.edu");
    expect(invite.role).toBe("member");
  });

  it("rejects signup when the email is not on the list", async () => {
    const getApprovedDoc = vi.fn().mockResolvedValue({ exists: () => false });

    await expect(ensureEmailApproved(getApprovedDoc, "stranger@college.edu")).rejects.toMatchObject({
      code: "app/not-approved",
    });
  });
});

describe("canRevokeInvite", () => {
  it("blocks removing your own invite", () => {
    expect(canRevokeInvite("Omkar@College.edu", "omkar@college.edu")).toEqual({
      ok: false,
      message: "You cannot remove your own invite.",
    });
  });

  it("allows removing a teammate invite", () => {
    expect(canRevokeInvite("  Pal@College.edu ", "omkar@college.edu")).toEqual({
      ok: true,
      email: "pal@college.edu",
    });
  });
});

describe("canChangeUserRole", () => {
  it("blocks demoting yourself or the last admin", () => {
    const users = [
      { id: "uid-1", email: "omkar@college.edu", role: "admin" },
      { id: "uid-2", email: "pal@college.edu", role: "member" },
    ];
    expect(
      canChangeUserRole({
        actorUid: "uid-1",
        targetUid: "uid-1",
        nextRole: "member",
        users,
      }),
    ).toEqual({ ok: false, message: "You cannot demote your own admin role." });
    expect(
      canChangeUserRole({
        actorUid: "uid-1",
        targetUid: "uid-1",
        nextRole: "member",
        users: [{ id: "uid-1", email: "omkar@college.edu", role: "admin" }],
      }).ok,
    ).toBe(false);
  });

  it("allows promoting a teammate", () => {
    expect(
      canChangeUserRole({
        actorUid: "uid-1",
        targetUid: "uid-2",
        nextRole: "admin",
        users: [
          { id: "uid-1", role: "admin" },
          { id: "uid-2", role: "member" },
        ],
      }),
    ).toEqual({ ok: true });
  });
});

describe("matchingProfileIds", () => {
  it("finds registered profiles for an invite email", () => {
    expect(
      matchingProfileIds(
        [
          { id: "uid-1", email: "Pal@College.edu" },
          { id: "uid-2", email: "other@college.edu" },
        ],
        "pal@college.edu",
      ),
    ).toEqual(["uid-1"]);
  });
});
