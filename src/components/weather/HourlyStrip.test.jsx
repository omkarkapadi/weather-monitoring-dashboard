import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HourlyStrip } from "./HourlyStrip.jsx";

describe("HourlyStrip", () => {
  it("renders a horizontal hourly forecast", () => {
    render(
      <HourlyStrip
        hours={[
          { timeLabel: "12:00 PM", temperature: "30°", precip: "8%", icon: "☀️" },
          { timeLabel: "1:00 PM", temperature: "31°", precip: "5%", icon: "☀️" },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: /hourly/i })).toBeInTheDocument();
    expect(screen.getByText("12:00 PM")).toBeInTheDocument();
    expect(screen.getByText("30°")).toBeInTheDocument();
    expect(screen.getByText("8%")).toBeInTheDocument();
  });

  it("keeps a full 24-hour row inside the hourly card", () => {
    const hours = Array.from({ length: 24 }, (_, index) => ({
      timeLabel: `${index}:00`,
      temperature: "30°",
      precip: "8%",
      icon: "☀️",
      condition: "Clear",
    }));

    render(<HourlyStrip hours={hours} />);

    const card = document.querySelector(".hourly-card");
    expect(card).toHaveClass("ui-card");
    expect(card.querySelectorAll(".hourly-strip li")).toHaveLength(24);
  });
});
