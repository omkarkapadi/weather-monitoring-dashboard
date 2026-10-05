import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NotApprovedPage } from "./NotApprovedPage.jsx";

const logout = vi.fn();

vi.mock("../context/AuthContext.jsx", () => ({
  useAuthContext: () => ({
    user: { email: "blocked@college.edu" },
    logout,
  }),
}));

describe("NotApprovedPage", () => {
  it("explains the invite block and lets the user log out", async () => {
    const user = userEvent.setup();
    render(<NotApprovedPage />);

    expect(screen.getByRole("heading", { name: /not approved/i })).toBeInTheDocument();
    expect(screen.getByText("blocked@college.edu")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /log out/i }));
    expect(logout).toHaveBeenCalled();
  });
});
