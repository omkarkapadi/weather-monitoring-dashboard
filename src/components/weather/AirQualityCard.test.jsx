import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AirQualityCard } from "./AirQualityCard.jsx";

describe("AirQualityCard", () => {
  it("explains US and European AQI in plain language", () => {
    render(
      <AirQualityCard
        air={{
          usAqi: 46,
          europeanAqi: 30,
          pm25: 12,
          pm10: 20,
          rating: { label: "Good", level: "good" },
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: /air quality/i })).toBeInTheDocument();
    expect(screen.getByText("46")).toBeInTheDocument();
    expect(screen.getByText(/good/i)).toBeInTheDocument();
    expect(screen.getByText(/12/)).toBeInTheDocument();
  });
});
