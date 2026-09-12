import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CurrentWeather } from "./CurrentWeather.jsx";

describe("CurrentWeather", () => {
  it("renders temperature and condition from a reading", () => {
    render(
      <CurrentWeather
        reading={{
          city: "Pune",
          temperature: 31.2,
          humidity: 40,
          windSpeed: 2,
          condition: "clear sky",
          fetchedAt: new Date("2026-09-12T09:00:00.000Z"),
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: /pune/i })).toBeInTheDocument();
    expect(screen.getByText("31°C")).toBeInTheDocument();
    expect(screen.getByText(/clear sky/i)).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("shows an empty-state message when there is no reading", () => {
    render(<CurrentWeather reading={null} />);
    expect(screen.getByText(/no data yet/i)).toBeInTheDocument();
  });
});
