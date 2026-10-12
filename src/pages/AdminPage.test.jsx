import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AdminPage } from "./AdminPage.jsx";

const addInvite = vi.fn().mockResolvedValue({ ok: true });
const removeInvite = vi.fn().mockResolvedValue({ ok: true });
const setUserRole = vi.fn().mockResolvedValue({ ok: true });

const directory = {
  invites: [],
  users: [],
  status: "ready",
  error: "",
  adding: false,
  addInvite,
  removeInvite,
  setUserRole,
};

vi.mock("../hooks/useAdminDirectory.js", () => ({
  useAdminDirectory: () => directory,
}));

vi.mock("../context/AuthContext.jsx", () => ({
  useAuthContext: () => ({
    user: { uid: "admin-uid", email: "omkar.kapadi@mitwpu.edu.in" },
  }),
}));

describe("AdminPage", () => {
  it("shows empty states when there are no invites or users", () => {
    directory.invites = [];
    directory.users = [];
    render(<AdminPage />);
    expect(screen.getByText(/no approved emails yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no members yet/i)).toBeInTheDocument();
  });

  it("shows validation when the invite form is submitted empty", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);
    await user.click(screen.getByRole("button", { name: /add email/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/enter an email address/i);
  });

  it("can revoke a teammate invite and promote a registered user", async () => {
    directory.invites = [{ id: "pal@college.edu", email: "pal@college.edu", role: "member" }];
    directory.users = [{ id: "uid-1", email: "pal@college.edu", role: "member" }];
    const user = userEvent.setup();
    render(<AdminPage />);

    await user.click(screen.getByRole("button", { name: /remove pal@college.edu/i }));
    expect(removeInvite).toHaveBeenCalledWith(
      "pal@college.edu",
      "omkar.kapadi@mitwpu.edu.in",
    );

    await user.click(screen.getByRole("button", { name: /make pal@college.edu admin/i }));
    expect(setUserRole).toHaveBeenCalledWith("uid-1", "admin", "admin-uid");
  });
});
