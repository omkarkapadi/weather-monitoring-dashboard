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
  locationId: location?.locationId || "",
}));

vi.mock("../context/AuthContext.jsx", () => ({
  useAuthContext: () => ({
    user: { uid: "member-uid", email: "omkar.kapadi@mitwpu.edu.in" },
    profile: {
      displayName: "Omkar",
      preferredLocation: {
        ...DEFAULT_HOME,
        label: "Pune, Maharashtra, India",
      },
      units: { temperature: "C", wind: "kmh", clock: "12h" },
      notificationsEnabled: false,
    },
    updateProfile: vi.fn().mockResolvedValue({ ok: true }),
  }),
}));

vi.mock("../hooks/useSavedPlaces.js", () => ({
  useSavedPlaces: () => ({
    places: [{ id: "18.51,73.81", label: "Kothrud", lat: 18.51, lon: 73.81 }],
    status: "ready",
    error: "",
    addPlace: vi.fn().mockResolvedValue({ ok: true, id: "18.51,73.81" }),
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

vi.mock("../components/PlaceMap.jsx", () => ({
  default: ({ lat, lon, onPinChange }) => (
    <div>
      <p data-testid="place-map">
        Map at {lat}, {lon}
      </p>
      <button type="button" onClick={() => onPinChange({ lat: 19.07, lon: 72.88 })}>
        Drag pin
      </button>
    </div>
  ),
}));

vi.mock("../weather/http.js", () => ({
  requestJson: vi.fn(async (url) => {
    if (String(url).includes("geocoding-api")) {
      return {
        results: [
          {
            name: "Mumbai",
            admin1: "Maharashtra",
            country: "India",
            latitude: "19.076",
            longitude: "72.8777",
          },
        ],
      };
    }
    return { results: [] };
  }),
  httpErrorMessage: (error) => error?.message || "Request failed.",
}));

describe("DashboardPage location selection", () => {
  it("updates the selected-place label and refetches weather for a search result", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    const placeCard = document.querySelector(".place-card");
    expect(placeCard).toHaveTextContent("Pune, Maharashtra, India");
    expect(useWeather).toHaveBeenLastCalledWith(
      expect.objectContaining({ label: "Pune, Maharashtra, India", lat: 18.52, lon: 73.86 }),
      expect.anything(),
    );

    await user.type(screen.getByLabelText(/search for a place/i), "Mumbai");
    await user.click(await screen.findByRole("option", { name: /mumbai, maharashtra/i }));

    expect(document.querySelector(".place-card")).toHaveTextContent("Mumbai, Maharashtra, India");
    expect(document.querySelector(".place-card")).not.toHaveTextContent("Pune, Maharashtra, India");
    expect(useWeather).toHaveBeenLastCalledWith(
      expect.objectContaining({
        label: "Mumbai, Maharashtra, India",
        lat: 19.076,
        lon: 72.8777,
        locationId: "19.08,72.88",
      }),
      expect.objectContaining({ enabled: true }),
    );
  });

  it("uses the same selection when a saved place is clicked or the pin is dragged", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    await user.click(screen.getByRole("button", { name: /kothrud/i }));
    expect(document.querySelector(".place-card")).toHaveTextContent("Kothrud");
    expect(useWeather).toHaveBeenLastCalledWith(
      expect.objectContaining({ label: "Kothrud", lat: 18.51, lon: 73.81 }),
      expect.anything(),
    );

    await user.click(screen.getByRole("button", { name: /drag pin/i }));
    expect(document.querySelector(".place-card")).toHaveTextContent("Dropped pin");
    expect(useWeather).toHaveBeenLastCalledWith(
      expect.objectContaining({ label: "Dropped pin", lat: 19.07, lon: 72.88 }),
      expect.anything(),
    );
  });
});
