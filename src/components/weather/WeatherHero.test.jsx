import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WeatherHero } from "./WeatherHero.jsx";

const hero = {
  place: "Pune",
  temperature: "30°",
  feelsLike: "34°",
  high: "33°",
  low: "20°",
  condition: "Mainly clear",
  visual: "clear",
  icon: "☀️",
  humidity: "42%",
  wind: "12 km/h NE",
  gust: "19 km/h",
  pressure: "1012 hPa",
  visibility: "10.0 km",
  uvIndex: "7",
  dewPoint: "16°",
  cloudCover: "18%",
  precip: "8%",
  sunrise: "6:21 AM",
  sunset: "6:20 PM",
  updatedAt: "Updated at 12:19 PM",
  aqi: { value: "46", label: "Good" },
};

describe("WeatherHero", () => {
  it("shows the current card fields from the AccuWeather-style layout", () => {
    render(<WeatherHero hero={hero} />);

    expect(screen.getByRole("heading", { name: /pune/i })).toBeInTheDocument();
    expect(screen.getByText("30°")).toBeInTheDocument();
    expect(screen.getByText(/mainly clear/i)).toBeInTheDocument();
    expect(screen.getByText(/feels like 34°/i)).toBeInTheDocument();
    expect(screen.getByText(/high 33°/i)).toBeInTheDocument();
    expect(screen.getByText(/low 20°/i)).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByText(/12 km\/h NE/)).toBeInTheDocument();
    expect(screen.getByText(/updated at 12:19 pm/i)).toBeInTheDocument();
  });
});
