import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_HOME } from "../weather/locationId.js";
import { MapPage } from "./MapPage.jsx";

const addPlace = vi.fn().mockResolvedValue({ ok: true, id: "19.08,72.88" });
const radar = {
  status: "ready",
  host: "https://tilecache.rainviewer.com",
  frames: [
    { time: 1720000000, path: "/v2/radar/1720000000" },
    { time: 1720000300, path: "/v2/radar/1720000300" },
  ],
  index: 1,
  setIndex: vi.fn(),
  playing: false,
  play: vi.fn(),
  pause: vi.fn(),
  opacity: 0.7,
  setOpacity: vi.fn(),
  tileUrl: "https://tilecache.rainviewer.com/v2/radar/1720000300/256/{z}/{x}/{y}/2/1_1.png",
  summary: "Radar frame 2 of 2 at 3:11 PM UTC.",
  error: "",
};

vi.mock("../context/AuthContext.jsx", () => ({
  useAuthContext: () => ({
    user: { uid: "member-uid", email: "omkar.kapadi@mitwpu.edu.in" },
    profile: {
      preferredLocation: DEFAULT_HOME,
      units: { temperature: "C", wind: "kmh", clock: "12h" },
    },
  }),
}));

vi.mock("../hooks/useSavedPlaces.js", () => ({
  useSavedPlaces: () => ({
    places: [{ id: "18.51,73.81", label: "Kothrud", lat: 18.51, lon: 73.81 }],
    status: "ready",
    error: "",
    addPlace,
  }),
}));

vi.mock("../hooks/useWeather.js", () => ({
  useWeather: (location) => ({
    status: "ready",
    forecast: {
      current: {
        temperature: 31,
        weatherCode: 1,
        isDay: 1,
      },
    },
    error: "",
    locationId: location?.locationId || "18.52,73.86",
  }),
}));

vi.mock("../hooks/useRadar.js", () => ({
  useRadar: () => radar,
}));

vi.mock("../components/PlaceMap.jsx", () => ({
  default: ({ lat, lon, savedPlaces, radarTileUrl }) => (
    <div
      data-testid="place-map"
      data-lat={lat}
      data-lon={lon}
      data-saved={savedPlaces?.length || 0}
      data-radar={radarTileUrl || ""}
    >
      Map
    </div>
  ),
}));

describe("MapPage", () => {
  beforeEach(() => {
    radar.playing = false;
    radar.pause.mockClear();
    radar.setIndex.mockClear();
    addPlace.mockClear();
  });

  it("shows radar controls, a text summary, and can save the pin", async () => {
    const user = userEvent.setup();
    render(<MapPage />);

    expect(screen.getByRole("heading", { name: /weather map/i })).toBeInTheDocument();
    expect(screen.getByTestId("place-map")).toHaveAttribute("data-saved", "1");
    expect(screen.getByTestId("place-map").getAttribute("data-radar")).toContain("rainviewer");
    expect(screen.getByText(/radar frame 2 of 2/i)).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /radar frame/i })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /radar opacity/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /play radar/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /rainviewer/i })).toHaveAttribute(
      "href",
      "https://www.rainviewer.com/",
    );

    await user.click(screen.getByRole("button", { name: /save this place/i }));
    expect(addPlace).toHaveBeenCalledWith(
      expect.objectContaining({ lat: DEFAULT_HOME.lat, lon: DEFAULT_HOME.lon }),
    );
    expect(document.querySelector(".radar-summary")).toHaveAttribute("aria-live", "polite");
  });

  it("does not live-announce frame ticks while radar is playing", async () => {
    radar.playing = true;
    render(<MapPage />);

    expect(document.querySelector(".radar-summary")).toHaveAttribute("aria-live", "off");
    fireEvent.change(screen.getByRole("slider", { name: /radar frame/i }), { target: { value: "0" } });
    expect(radar.pause).toHaveBeenCalled();
    expect(radar.setIndex).toHaveBeenCalledWith(0);
  });
});
