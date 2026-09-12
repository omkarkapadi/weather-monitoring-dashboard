import { describe, expect, it, vi } from "vitest";
import {
  ensureEmailApproved,
  isAdmin,
  isApproved,
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
