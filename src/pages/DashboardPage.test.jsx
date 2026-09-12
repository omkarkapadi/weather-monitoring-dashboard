import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DashboardPage } from "./DashboardPage.jsx";

const useReadings = vi.fn(() => ({
  readings: [],
  status: "empty",
  error: "",
  latest: null,
}));

vi.mock("../context/AuthContext.jsx", () => ({
  useAuthContext: () => ({
    user: { email: "omkar.kapadi@mitwpu.edu.in" },
    profile: { preferredCity: "Pune" },
  }),
}));

vi.mock("../hooks/useReadings.js", () => ({
  useReadings: (...args) => useReadings(...args),
}));

vi.mock("../hooks/useIngestCities.js", () => ({
  useIngestCities: () => ({ cities: ["Mumbai", "Pune"], status: "ready" }),
}));

describe("DashboardPage", () => {
  it("defaults to the preferred city and can switch to another ingested city", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    const citySelect = screen.getByLabelText(/city/i);
    expect(citySelect).toHaveValue("Pune");
    expect(useReadings).toHaveBeenCalledWith(true, "Pune");

    await user.selectOptions(citySelect, "Mumbai");
    expect(useReadings).toHaveBeenLastCalledWith(true, "Mumbai");
  });
});
