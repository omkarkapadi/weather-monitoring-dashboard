import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatusPage } from "./StatusPage.jsx";

const ingest = {
  rows: [],
  status: "ready",
  error: "",
};

vi.mock("../hooks/useIngestStatus.js", () => ({
  useIngestStatus: () => ingest,
}));

describe("StatusPage", () => {
  it("explains the scheduled job and shows an empty state", () => {
    ingest.rows = [];
    ingest.status = "ready";
    ingest.error = "";
    render(<StatusPage />);

    expect(screen.getByRole("heading", { name: /system status/i })).toBeInTheDocument();
    expect(screen.getByText(/at most 10/i)).toBeInTheDocument();
    expect(screen.getByText(/not the live open-meteo desk/i)).toBeInTheDocument();
    expect(screen.getByText(/no ingest runs yet/i)).toBeInTheDocument();
  });

  it("lists last success and last error for each city", () => {
    ingest.rows = [
      {
        id: "pune",
        city: "Pune",
        lastSuccessAt: new Date("2026-10-12T04:00:00.000Z"),
        lastError: null,
      },
      {
        id: "mumbai",
        city: "Mumbai",
        lastSuccessAt: new Date("2026-10-11T10:00:00.000Z"),
        lastError: "OpenWeather request failed: 401",
      },
    ];
    ingest.status = "ready";
    render(<StatusPage />);

    expect(screen.getByText("Pune")).toBeInTheDocument();
    expect(screen.getByText("Mumbai")).toBeInTheDocument();
    expect(screen.getByText(/openweather request failed: 401/i)).toBeInTheDocument();
    expect(screen.getByText(/ok/i)).toBeInTheDocument();
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
