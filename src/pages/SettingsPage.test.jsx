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

vi.mock("../hooks/useIngestCities.js", () => ({
  useIngestCities: () => ({ cities: ["Mumbai", "Pune"], status: "ready" }),
}));

describe("SettingsPage", () => {
  it("lists tracked cities and saves a dropdown selection", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    expect(screen.getByText("omkar.kapadi@mitwpu.edu.in")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    const citySelect = screen.getByLabelText(/preferred city/i);
    expect(citySelect.tagName).toBe("SELECT");
    expect(screen.getByRole("option", { name: "Mumbai" })).toBeInTheDocument();
    await user.selectOptions(citySelect, "Mumbai");
    await user.click(screen.getByRole("button", { name: /save settings/i }));

    expect(updateProfile).toHaveBeenCalledWith({
      displayName: "Omkar",
      preferredCity: "Mumbai",
    });
  });

  it("saves a newly typed city that is not in ingestStatus yet", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.type(screen.getByLabelText(/add a new city/i), "Nashik");
    await user.click(screen.getByRole("button", { name: /save settings/i }));

    expect(updateProfile).toHaveBeenLastCalledWith({
      displayName: "Omkar",
      preferredCity: "Nashik",
    });
  });
});
