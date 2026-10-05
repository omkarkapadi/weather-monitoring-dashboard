import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_HOME } from "../weather/locationId.js";
import { SettingsPage } from "./SettingsPage.jsx";

const updateProfile = vi.fn().mockResolvedValue({ ok: true });

vi.mock("../context/AuthContext.jsx", () => ({
  useAuthContext: () => ({
    user: { email: "omkar.kapadi@mitwpu.edu.in" },
    profile: {
      email: "omkar.kapadi@mitwpu.edu.in",
      displayName: "Omkar",
      preferredLocation: DEFAULT_HOME,
      units: { temperature: "C", wind: "kmh", clock: "12h" },
      notificationsEnabled: false,
      role: "admin",
      createdAt: { toDate: () => new Date("2026-09-12T09:00:00.000Z") },
    },
    role: "admin",
    updateProfile,
  }),
}));

vi.mock("../components/PlacePicker.jsx", () => ({
  PlacePicker: ({ location, onPinChange }) => (
    <div>
      <div data-testid="place-picker">
        Map at {location.lat}, {location.lon}
      </div>
      <button
        type="button"
        onClick={() =>
          onPinChange({
            locationId: "18.51,73.86",
            label: "Kasba Peth, Pune",
            lat: 18.51,
            lon: 73.86,
          })
        }
      >
        Drop pin
      </button>
    </div>
  ),
}));

describe("SettingsPage", () => {
  it("saves home location, units, and notifications without a city dropdown", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    expect(screen.getByText("omkar.kapadi@mitwpu.edu.in")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByTestId("place-picker")).toHaveTextContent("18.52");
    expect(screen.queryByLabelText(/preferred city/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /drop pin/i }));
    await user.selectOptions(screen.getByLabelText(/temperature/i), "F");
    await user.click(screen.getByLabelText(/notifications/i));
    await user.click(screen.getByRole("button", { name: /save settings/i }));

    expect(updateProfile).toHaveBeenCalledWith({
      displayName: "Omkar",
      preferredLocation: {
        locationId: "18.51,73.86",
        label: "Kasba Peth, Pune",
        lat: 18.51,
        lon: 73.86,
      },
      units: { temperature: "F", wind: "kmh", clock: "12h" },
      notificationsEnabled: true,
    });
  });
});
