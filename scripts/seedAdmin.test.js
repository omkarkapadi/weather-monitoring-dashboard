import { describe, expect, it, vi } from "vitest";
import { seedAdmin } from "./seedAdmin.js";

function createFakeDb({ profiles = [] } = {}) {
  const set = vi.fn().mockResolvedValue();
  const update = vi.fn().mockResolvedValue();
  const where = vi.fn().mockResolvedValue({
    docs: profiles.map((profile) => ({
      id: profile.id,
      ref: { update },
    })),
  });

  return {
    db: {
      collection: vi.fn((name) => {
        if (name === "approvedEmails") {
          return {
            doc: () => ({ set }),
          };
        }
        return { where: () => ({ get: where }) };
      }),
    },
    set,
    update,
    where,
  };
}

describe("seedAdmin", () => {
  it("writes the approved admin email and promotes matching profiles", async () => {
    const { db, set, update } = createFakeDb({
      profiles: [{ id: "uid-omkar" }],
    });

    const result = await seedAdmin(db, "Omkar.Kapadi@mitwpu.edu.in");

    expect(set).toHaveBeenCalledWith(
      {
        email: "omkar.kapadi@mitwpu.edu.in",
        role: "admin",
        addedAt: expect.any(Date),
      },
      { merge: true },
    );
    expect(update).toHaveBeenCalledWith({ role: "admin" });
    expect(result).toEqual({
      email: "omkar.kapadi@mitwpu.edu.in",
      promoted: ["uid-omkar"],
    });
  });
});
