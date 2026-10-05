import { useState } from "react";
import PlaceMap from "../components/PlaceMap.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { Toast } from "../components/ui/Toast.jsx";
import { useAuthContext } from "../context/AuthContext.jsx";
import { useRadar } from "../hooks/useRadar.js";
import { useSavedPlaces } from "../hooks/useSavedPlaces.js";
import { useWeather } from "../hooks/useWeather.js";
import { resolveHomeLocation } from "../utils/profileUpdate.js";
import { toSelectedLocation } from "../utils/selectedLocation.js";
import { formatTemp } from "../weather/display.js";
import { defaultUnits } from "../weather/units.js";
import { mapWmo } from "../weather/wmo.js";

export function MapPage() {
  const { user, profile } = useAuthContext();
  const [location, setLocation] = useState(() => resolveHomeLocation(profile));
  const [toast, setToast] = useState({ message: "", tone: "info" });
  const saved = useSavedPlaces(user?.uid);
  const weather = useWeather(location, { enabled: Boolean(user) });
  const radar = useRadar();
  const units = profile?.units || defaultUnits();
  const condition = weather.forecast
    ? mapWmo(weather.forecast.current.weatherCode, weather.forecast.current.isDay)
    : null;

  function selectLocation(next) {
    const selected = toSelectedLocation(next, location);
    if (selected) {
      setLocation(selected);
    }
  }

  async function savePlace() {
    const result = await saved.addPlace(location);
    setToast({
      message: result?.ok ? "Place saved." : result?.message || "Could not save that place.",
      tone: result?.ok ? "info" : "error",
    });
  }

  return (
    <section className="map-board">
      <article className="panel-card map-card">
        <p className="eyebrow">Radar</p>
        <h2>Weather map</h2>
        <p id="place-map-help" className="meta">
          Click the map to drop a pin. Teal dots are saved places. Radar frames come from RainViewer.
        </p>
        <PlaceMap
          variant="explorer"
          lat={location.lat}
          lon={location.lon}
          onPinChange={selectLocation}
          savedPlaces={saved.places}
          radarTileUrl={radar.tileUrl}
          radarOpacity={radar.opacity}
          onSavedPlaceClick={selectLocation}
        />
        <p className="radar-summary" aria-live={radar.playing ? "off" : "polite"} aria-atomic="true">
          {radar.summary}
        </p>
        {radar.error ? (
          <p className="banner banner-error" role="alert">
            {radar.error}
          </p>
        ) : null}
        <div className="radar-controls">
          <button type="button" onClick={radar.playing ? radar.pause : radar.play}>
            {radar.playing ? "Pause radar" : "Play radar"}
          </button>
          <label htmlFor="radar-frame">
            Radar frame
            <input
              id="radar-frame"
              type="range"
              min={0}
              max={Math.max(0, radar.frames.length - 1)}
              value={radar.index}
              onChange={(event) => {
                radar.pause();
                radar.setIndex(Number(event.target.value));
              }}
              aria-valuetext={radar.playing ? undefined : radar.summary}
            />
          </label>
          <label htmlFor="radar-opacity">
            Radar opacity
            <input
              id="radar-opacity"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={radar.opacity}
              onChange={(event) => radar.setOpacity(Number(event.target.value))}
            />
          </label>
        </div>
        <p className="meta">
          Radar tiles by{" "}
          <a href="https://www.rainviewer.com/" rel="noreferrer">
            RainViewer
          </a>
          .
        </p>
        <article className="map-popup ui-card">
          <p className="eyebrow">At this pin</p>
          <h3>{location.label}</h3>
          {weather.status === "loading" ? <Skeleton lines={2} /> : null}
          {weather.status === "ready" && condition ? (
            <p>
              {formatTemp(weather.forecast.current.temperature, units.temperature)} · {condition.text}
            </p>
          ) : null}
          {weather.error ? (
            <p className="banner banner-error" role="alert">
              {weather.error}
            </p>
          ) : null}
          <button type="button" onClick={savePlace}>
            Save this place
          </button>
        </article>
        <Toast message={toast.message || saved.error} tone={saved.error ? "error" : toast.tone} />
      </article>
    </section>
  );
}

export default MapPage;
