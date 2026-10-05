import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import WeatherTrendChart from "./WeatherTrendChart.jsx";

beforeAll(() => {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

describe("WeatherTrendChart", () => {
  it("keeps the 48-hour table inside the chart frame so it cannot widen the weather column", () => {
    render(
      <WeatherTrendChart
        points={[
          { time: "12 PM", temperature: 30, precip: 8, wind: 12 },
          { time: "1 PM", temperature: 31, precip: 5, wind: 11 },
        ]}
      />,
    );

    const frame = document.querySelector(".chart-frame");
    expect(frame).not.toHaveAttribute("role", "img");
    expect(frame).toContainElement(screen.getByRole("table", { name: /next 48 hours/i }));
    expect(frame.querySelector(".chart-graphic")).toHaveAttribute("role", "img");
  });
});
