import { describe, expect, it, vi } from "vitest";
import { submitApprovedEmail } from "./useAdminDirectory.js";

describe("submitApprovedEmail", () => {
  it("writes a normalized member invite", async () => {
    const setInviteDoc = vi.fn().mockResolvedValue();
    const result = await submitApprovedEmail(setInviteDoc, "  Pal@College.edu ", "member");

    expect(result).toEqual({ ok: true, email: "pal@college.edu" });
    expect(setInviteDoc).toHaveBeenCalledWith("pal@college.edu", {
      email: "pal@college.edu",
      role: "member",
      addedAt: expect.any(Date),
    });
  });

  it("does not write when the email is empty", async () => {
    const setInviteDoc = vi.fn();
    const result = await submitApprovedEmail(setInviteDoc, "   ");
    expect(result.ok).toBe(false);
    expect(setInviteDoc).not.toHaveBeenCalled();
  });
});
