import { StrictMode } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_HOME } from "../weather/locationId.js";
import { DashboardPage } from "./DashboardPage.jsx";

const forecast = {
  timezone: "Asia/Kolkata",
  current: {
    time: "2026-10-05T12:19",
    temperature: 42,
    feelsLike: 46,
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
    { time: "2026-10-05T12:00", temperature: 42, precipitationProbability: 8, windSpeed: 3.3, weatherCode: 1 },
  ],
  daily: [
    {
      date: "2026-10-05",
      high: 44,
      low: 28,
      weatherCode: 1,
      sunrise: "2026-10-05T06:21",
      sunset: "2026-10-05T18:20",
      precipitationProbability: 10,
    },
  ],
};

vi.mock("../context/AuthContext.jsx", () => ({
  useAuthContext: () => ({
    user: { uid: "member-uid", email: "omkar.kapadi@mitwpu.edu.in" },
    profile: {
      displayName: "Omkar",
      preferredLocation: DEFAULT_HOME,
      units: { temperature: "C", wind: "kmh", clock: "12h" },
      notificationsEnabled: true,
    },
    updateProfile: vi.fn(),
  }),
}));

vi.mock("../hooks/useSavedPlaces.js", () => ({
  useSavedPlaces: () => ({
    places: [],
    status: "ready",
    error: "",
    addPlace: vi.fn(),
  }),
}));

vi.mock("../hooks/useWeather.js", () => ({
  useWeather: () => ({
    status: "ready",
    forecast,
    air: { usAqi: 46, europeanAqi: 30, pm25: 12, pm10: 20 },
    error: "",
    locationId: "18.52,73.86",
  }),
  usePlaceSummaries: () => ({ summaries: {}, status: "ready" }),
}));

vi.mock("../components/weather/WeatherTrendChart.jsx", () => ({
  default: () => <div>Trend chart</div>,
}));

vi.mock("../components/PlacePicker.jsx", () => ({
  PlacePicker: () => <div data-testid="place-picker">Map</div>,
}));

describe("DashboardPage notifications", () => {
  const notifyCtor = vi.fn();
  const OriginalNotification = globalThis.Notification;

  beforeEach(() => {
    notifyCtor.mockClear();
    class FakeNotification {
      static permission = "granted";
      constructor(title, options) {
        notifyCtor(title, options);
      }
    }
    globalThis.Notification = FakeNotification;
  });

  afterEach(() => {
    globalThis.Notification = OriginalNotification;
  });

  it("shows a browser notification once for a new alert while the tab is visible", () => {
    const { rerender } = render(
      <StrictMode>
        <DashboardPage />
      </StrictMode>,
    );
    rerender(
      <StrictMode>
        <DashboardPage />
      </StrictMode>,
    );

    expect(screen.getByText(/extreme heat/i)).toBeInTheDocument();
    expect(screen.getByText(/not an official warning feed/i)).toBeInTheDocument();
    expect(notifyCtor).toHaveBeenCalledTimes(1);
    expect(notifyCtor).toHaveBeenCalledWith("Weather desk", {
      body: "Extreme heat: temperature is above 40°C.",
    });
  });
});
