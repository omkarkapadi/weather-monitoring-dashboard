import { describe, expect, it } from "vitest";
import { evaluateAlerts } from "./alerts.js";

describe("evaluateAlerts", () => {
  it("flags extreme heat", () => {
    const alerts = evaluateAlerts({ temperatureC: 41, weatherCode: 0, usAqi: 40 });
    expect(alerts.some((alert) => /heat/i.test(alert.message))).toBe(true);
  });

  it("flags extreme cold", () => {
    const alerts = evaluateAlerts({ temperatureC: 4, weatherCode: 0, usAqi: 40 });
    expect(alerts.some((alert) => /cold/i.test(alert.message))).toBe(true);
  });

  it("flags thunderstorms", () => {
    const alerts = evaluateAlerts({ temperatureC: 22, weatherCode: 95, usAqi: 20 });
    expect(alerts.some((alert) => /thunder/i.test(alert.message))).toBe(true);
  });

  it("flags poor air quality", () => {
    const alerts = evaluateAlerts({ temperatureC: 22, weatherCode: 1, usAqi: 160 });
    expect(alerts.some((alert) => /air/i.test(alert.message))).toBe(true);
  });

  it("returns nothing on a quiet day", () => {
    expect(evaluateAlerts({ temperatureC: 24, weatherCode: 1, usAqi: 40 })).toEqual([]);
  });
});
