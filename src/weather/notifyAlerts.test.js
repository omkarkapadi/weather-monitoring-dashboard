import { describe, expect, it, vi } from "vitest";
import { alertsToNotify, showAlertNotifications } from "./notifyAlerts.js";

const heat = { id: "heat", message: "Extreme heat: temperature is above 40°C." };

describe("alertsToNotify", () => {
  it("only notifies new alerts while notifications are on and the tab is visible", () => {
    expect(alertsToNotify([heat], { notifiedIds: new Set(), enabled: false, visible: true })).toEqual([]);
    expect(alertsToNotify([heat], { notifiedIds: new Set(), enabled: true, visible: false })).toEqual([]);
    expect(alertsToNotify([heat], { notifiedIds: new Set(["heat"]), enabled: true, visible: true })).toEqual([]);
    expect(alertsToNotify([heat], { notifiedIds: new Set(), enabled: true, visible: true })).toEqual([heat]);
  });
});

describe("showAlertNotifications", () => {
  it("sends each alert once and remembers the id", () => {
    const notify = vi.fn();
    const first = showAlertNotifications([heat], { notify, notifiedIds: new Set() });
    const second = showAlertNotifications([heat], { notify, notifiedIds: first });
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith(heat.message);
    expect(second.has("heat")).toBe(true);
  });
});
