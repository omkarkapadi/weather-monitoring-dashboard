import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_HOME } from "../weather/locationId.js";
import { HistoryPage } from "./HistoryPage.jsx";

const downloadCsv = vi.fn();

vi.mock("../weather/csv.js", async () => {
  const actual = await vi.importActual("../weather/csv.js");
  return {
    ...actual,
    downloadCsv: (...args) => downloadCsv(...args),
  };
});

vi.mock("../context/AuthContext.jsx", () => ({
  useAuthContext: () => ({
    user: { uid: "member-uid" },
    profile: {
      preferredLocation: DEFAULT_HOME,
      units: { temperature: "C", wind: "kmh", clock: "12h" },
    },
  }),
}));

vi.mock("../hooks/useArchive.js", () => ({
  useArchive: () => ({
    status: "ready",
    days: [
      { date: "2026-09-27", high: 31.2, low: 22.1, precipitation: 0 },
      { date: "2026-09-28", high: 32, low: 21, precipitation: 4.6 },
    ],
    error: "",
    range: { start: "2026-09-27", end: "2026-09-28" },
  }),
}));

vi.mock("../components/weather/ArchiveChart.jsx", () => ({
  default: () => <div>Archive chart</div>,
}));

describe("HistoryPage", () => {
  it("lists the shown archive rows and exports them as CSV", async () => {
    const user = userEvent.setup();
    render(<HistoryPage />);

    expect(screen.getByRole("heading", { name: /history/i })).toBeInTheDocument();
    expect(screen.getByText("2026-09-27")).toBeInTheDocument();
    expect(screen.getByText("4.6 mm")).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /download csv/i }));
    expect(downloadCsv).toHaveBeenCalled();
    const [csv, fileName] = downloadCsv.mock.calls[0];
    expect(csv).toContain("date,high,low,precipitation,place");
    expect(csv).toContain("2026-09-28");
    expect(csv).toContain("Pune");
    expect(fileName).toMatch(/2026-09-27-to-2026-09-28\.csv$/);
  });
});
