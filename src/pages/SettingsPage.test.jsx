import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SettingsPage } from "./SettingsPage.jsx";

const updateProfile = vi.fn().mockResolvedValue({ ok: true });

vi.mock("../context/AuthContext.jsx", () => ({
  useAuthContext: () => ({
    user: { email: "omkar.kapadi@mitwpu.edu.in" },
    profile: {
      email: "omkar.kapadi@mitwpu.edu.in",
      displayName: "Omkar",
      preferredCity: "Pune",
      role: "admin",
      createdAt: { toDate: () => new Date("2026-09-12T09:00:00.000Z") },
    },
    role: "admin",
    updateProfile,
  }),
}));

describe("SettingsPage", () => {
  it("shows read-only account fields and saves a new preferred city", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    expect(screen.getByText("omkar.kapadi@mitwpu.edu.in")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    const cityInput = screen.getByLabelText(/preferred city/i);
    await user.clear(cityInput);
    await user.type(cityInput, "Mumbai");
    await user.click(screen.getByRole("button", { name: /save settings/i }));

    expect(updateProfile).toHaveBeenCalledWith({
      displayName: "Omkar",
      preferredCity: "Mumbai",
    });
  });
});
