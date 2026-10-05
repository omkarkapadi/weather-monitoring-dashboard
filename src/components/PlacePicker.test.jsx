import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_HOME } from "../weather/locationId.js";
import { PlacePicker, searchPlaces } from "./PlacePicker.jsx";

vi.mock("./PlaceMap.jsx", () => ({
  default: ({ lat, lon }) => (
    <div data-testid="place-map">
      Map at {lat}, {lon}
    </div>
  ),
}));

describe("searchPlaces", () => {
  it("asks OpenStreetMap when Open-Meteo has no neighbourhood", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ generationtime_ms: 0.2 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            display_name: "Kothrud, Karve Nagar, Pune, Maharashtra, India",
            lat: "18.5072618",
            lon: "73.8056676",
          },
        ],
      });

    const results = await searchPlaces("Kothrud", fetchFn);

    expect(results[0]).toEqual({
      label: "Kothrud, Karve Nagar, Pune, Maharashtra, India",
      lat: 18.5072618,
      lon: 73.8056676,
    });
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(String(fetchFn.mock.calls[1][0])).toContain("nominatim.openstreetmap.org");
  });
});

describe("PlacePicker", () => {
  it("uses the map as the picker and treats search as a recenter helper", async () => {
    const user = userEvent.setup();
    const onPinChange = vi.fn();
    const onSearch = vi.fn().mockResolvedValue([
      { label: "Kothrud, Pune, Maharashtra, India", lat: 18.51, lon: 73.81 },
      { label: "Kothrud Bus Depot, Pune, India", lat: 18.5, lon: 73.81 },
    ]);

    render(
      <PlacePicker
        location={DEFAULT_HOME}
        onPinChange={onPinChange}
        onSearch={onSearch}
      />,
    );

    expect(await screen.findByTestId("place-map")).toHaveTextContent("18.52");
    await user.type(screen.getByLabelText(/search for a place/i), "Kothrud");
    expect(await screen.findByRole("option", { name: /kothrud, pune/i })).toBeInTheDocument();

    const option = await screen.findByRole("option", { name: /kothrud, pune/i });
    expect(option.tagName).toBe("LI");
    expect(option.closest("[role='listitem']")).toBeNull();
    expect(screen.getByLabelText(/search for a place/i)).toHaveAttribute(
      "aria-controls",
      "place-suggestions",
    );

    await user.click(option);
    expect(onPinChange).toHaveBeenCalledWith({
      locationId: "18.51,73.81",
      label: "Kothrud, Pune, Maharashtra, India",
      lat: 18.51,
      lon: 73.81,
    });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it("lists neighbourhood matches that share a coordinate", async () => {
    const user = userEvent.setup();
    render(
      <PlacePicker
        location={DEFAULT_HOME}
        onPinChange={vi.fn()}
        onSearch={vi.fn().mockResolvedValue([
          { label: "Kothrud, Karve Nagar", lat: 18.5072618, lon: 73.8056676 },
          { label: "Kothrud, Pune", lat: 18.5072618, lon: 73.8056676 },
        ])}
      />,
    );

    await user.type(screen.getByLabelText(/search for a place/i), "Kothrud");
    expect(await screen.findByRole("option", { name: /karve nagar/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /kothrud, pune/i })).toBeInTheDocument();
  });

  it("treats a typed coordinate jump like a dropped pin", () => {
    const onPinChange = vi.fn();
    render(
      <PlacePicker location={DEFAULT_HOME} onPinChange={onPinChange} onSearch={vi.fn()} />,
    );

    fireEvent.change(screen.getByLabelText(/longitude/i), { target: { value: "72.88" } });

    expect(onPinChange).toHaveBeenLastCalledWith({
      locationId: "18.52,72.88",
      label: "Dropped pin",
      lat: 18.52,
      lon: 72.88,
    });
  });

  it("explains when browser location is blocked", async () => {
    const user = userEvent.setup();
    render(
      <PlacePicker
        location={DEFAULT_HOME}
        onPinChange={vi.fn()}
        onSearch={vi.fn()}
        geolocate={() => Promise.reject(new Error("denied"))}
      />,
    );

    await user.click(screen.getByRole("button", { name: /use my location/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/permission was denied/i);
  });

  it("shows a search failure instead of an empty list", async () => {
    const user = userEvent.setup();
    render(
      <PlacePicker
        location={DEFAULT_HOME}
        onPinChange={vi.fn()}
        onSearch={() => Promise.reject(new Error("offline"))}
      />,
    );

    await user.type(screen.getByLabelText(/search for a place/i), "Kothrud");
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not search/i);
  });
});

