import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_HOME } from "../weather/locationId.js";
import { DashboardPage } from "./DashboardPage.jsx";

const forecast = {
  timezone: "Asia/Kolkata",
  current: {
    time: "2026-10-05T12:19",
    temperature: 30,
    feelsLike: 34,
    weatherCode: 1,
    isDay: 1,
    humidity: 42,
    windSpeed: 3.33,
    windDirection: 67,
    windGusts: 5.2,
    pressure: 1012,
    visibility: 10000,
    uvIndex: 7,
    dewPoint: 16,
    cloudCover: 18,
    precipitationProbability: 8,
  },
  hourly: [
    { time: "2026-10-05T12:00", temperature: 30, precipitationProbability: 8, windSpeed: 3.3, weatherCode: 1 },
    { time: "2026-10-05T13:00", temperature: 31, precipitationProbability: 5, windSpeed: 3.5, weatherCode: 1 },
  ],
  daily: [
    {
      date: "2026-10-05",
      high: 33,
      low: 20,
      weatherCode: 1,
      sunrise: "2026-10-05T06:21",
      sunset: "2026-10-05T18:20",
      precipitationProbability: 10,
    },
  ],
};

const useWeather = vi.fn((location) => ({
  status: "ready",
  forecast,
  air: { usAqi: 46, europeanAqi: 30, pm25: 12, pm10: 20 },
  error: "",
  locationId: location?.locationId || "18.52,73.86",
}));

const updateProfile = vi.fn().mockResolvedValue({ ok: true });
const addPlace = vi.fn().mockResolvedValue({ ok: true, id: "18.51,73.81" });

vi.mock("../context/AuthContext.jsx", () => ({
  useAuthContext: () => ({
    user: { uid: "member-uid", email: "omkar.kapadi@mitwpu.edu.in" },
    profile: {
      displayName: "Omkar",
      preferredLocation: DEFAULT_HOME,
      units: { temperature: "C", wind: "kmh", clock: "12h" },
      notificationsEnabled: false,
    },
    updateProfile,
  }),
}));

vi.mock("../hooks/useSavedPlaces.js", () => ({
  useSavedPlaces: () => ({
    places: [{ id: "18.51,73.81", label: "Kothrud", lat: 18.51, lon: 73.81 }],
    status: "ready",
    error: "",
    addPlace,
  }),
}));

vi.mock("../hooks/useWeather.js", () => ({
  useWeather: (...args) => useWeather(...args),
  usePlaceSummaries: () => ({
    summaries: { "18.51,73.81": { temperature: "29°" } },
    status: "ready",
  }),
}));

vi.mock("../components/weather/WeatherTrendChart.jsx", () => ({
  default: () => <div>Trend chart</div>,
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
            locationId: "19.08,72.88",
            label: "Mumbai",
            lat: 19.08,
            lon: 72.88,
          })
        }
      >
        Drop pin
      </button>
    </div>
  ),
}));

describe("DashboardPage", () => {
  it("keeps current weather on screen next to the place picker", () => {
    render(<DashboardPage />);

    const place = document.querySelector(".weather-board-place");
    const now = document.querySelector(".weather-board-now");
    expect(place).toContainElement(screen.getByText("Selected place"));
    expect(now).toContainElement(screen.getByText("Current weather"));
    expect(now).toContainElement(screen.getByRole("heading", { name: /hourly forecast/i }));
  });

  it("loads on-demand weather for the pin instead of scheduled readings", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    expect(screen.getByTestId("place-picker")).toHaveTextContent("18.52");
    expect(screen.getAllByText("30°").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: /hourly forecast/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /daily forecast/i })).toBeInTheDocument();
    expect(useWeather).toHaveBeenCalledWith(
      expect.objectContaining({ label: "Pune", lat: 18.52, lon: 73.86 }),
      expect.objectContaining({ enabled: true }),
    );

    await user.click(screen.getByRole("button", { name: /drop pin/i }));
    expect(useWeather).toHaveBeenLastCalledWith(
      expect.objectContaining({ label: "Mumbai" }),
      expect.objectContaining({ enabled: true }),
    );
  });

  it("sets the dropped pin as home and can switch to a saved place", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    await user.click(screen.getByRole("button", { name: /drop pin/i }));
    await user.click(screen.getByRole("button", { name: /set as home/i }));

    expect(updateProfile).toHaveBeenCalledWith({
      displayName: "Omkar",
      preferredLocation: {
        locationId: "19.08,72.88",
        label: "Mumbai",
        lat: 19.08,
        lon: 72.88,
      },
      units: { temperature: "C", wind: "kmh", clock: "12h" },
      notificationsEnabled: false,
    });

    await user.click(screen.getByRole("button", { name: /save place/i }));
    expect(addPlace).toHaveBeenCalledWith({
      locationId: "19.08,72.88",
      label: "Mumbai",
      lat: 19.08,
      lon: 72.88,
    });

    await user.click(screen.getByRole("button", { name: /kothrud/i }));
    expect(useWeather).toHaveBeenLastCalledWith(
      expect.objectContaining({ label: "Kothrud" }),
      expect.objectContaining({ enabled: true }),
    );
  });

  it("shows a toast when saving a place is denied", async () => {
    addPlace.mockResolvedValueOnce({
      ok: false,
      message: "Permission denied. Deploy the latest Firestore rules, then try again.",
    });
    const user = userEvent.setup();
    render(<DashboardPage />);

    await user.click(screen.getByRole("button", { name: /save place/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/permission denied/i);
  });
});
