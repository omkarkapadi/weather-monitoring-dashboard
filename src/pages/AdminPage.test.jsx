import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AdminPage } from "./AdminPage.jsx";

vi.mock("../hooks/useAdminDirectory.js", () => ({
  useAdminDirectory: () => ({
    invites: [],
    users: [],
    status: "ready",
    error: "",
    adding: false,
    addInvite: vi.fn().mockResolvedValue({ ok: true }),
  }),
}));

describe("AdminPage", () => {
  it("shows empty states when there are no invites or users", () => {
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
});
