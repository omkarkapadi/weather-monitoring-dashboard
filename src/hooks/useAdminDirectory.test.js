import { describe, expect, it, vi } from "vitest";
import { promoteProfilesByEmail, submitApprovedEmail } from "./useAdminDirectory.js";

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

describe("promoteProfilesByEmail", () => {
  it("updates matching profiles to the invite role", async () => {
    const updateProfileDoc = vi.fn().mockResolvedValue();
    const ids = await promoteProfilesByEmail(
      updateProfileDoc,
      [
        { id: "uid-1", email: "pal@college.edu" },
        { id: "uid-2", email: "other@college.edu" },
      ],
      "Pal@College.edu",
      "admin",
    );
    expect(ids).toEqual(["uid-1"]);
    expect(updateProfileDoc).toHaveBeenCalledWith("uid-1", { role: "admin" });
    expect(updateProfileDoc).toHaveBeenCalledTimes(1);
  });
});
