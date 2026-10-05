import { describe, expect, it } from "vitest";
import { approvedFromSnapshot } from "./useApproved.js";

describe("approvedFromSnapshot", () => {
  it("is unknown until a signed-in user is checked", () => {
    expect(approvedFromSnapshot(null, { exists: () => true })).toBeNull();
  });

  it("is true only when the approvedEmails doc exists", () => {
    expect(approvedFromSnapshot({ uid: "u1" }, { exists: () => true })).toBe(true);
    expect(approvedFromSnapshot({ uid: "u1" }, { exists: () => false })).toBe(false);
  });
});
