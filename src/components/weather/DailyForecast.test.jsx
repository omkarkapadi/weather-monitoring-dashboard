import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DailyForecast } from "./DailyForecast.jsx";

describe("DailyForecast", () => {
  it("lists daily high, low, and rain chance", () => {
    render(
      <DailyForecast
        days={[
          { heading: "Today", dateLabel: "10/5", high: "33°", low: "20°", precip: "10%", icon: "☀️", condition: "Mainly clear" },
          { heading: "Tue", dateLabel: "10/6", high: "32°", low: "21°", precip: "20%", icon: "⛅", condition: "Partly cloudy" },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: /daily forecast/i })).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("33°")).toBeInTheDocument();
    expect(screen.getByText("20°")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
    expect(screen.getByText("Mainly clear")).toBeInTheDocument();
  });

  it("keeps a long outlook inside the daily card", () => {
    const days = Array.from({ length: 16 }, (_, index) => ({
      heading: `Day ${index + 1}`,
      dateLabel: `10/${index + 5}`,
      high: "30°",
      low: "20°",
      precip: "10%",
      icon: "☀️",
      condition: "Mainly clear",
    }));

    render(<DailyForecast days={days} />);

    const card = document.querySelector(".daily-card");
    expect(card).toHaveClass("ui-card");
    expect(card.querySelectorAll("li")).toHaveLength(16);
  });
});
