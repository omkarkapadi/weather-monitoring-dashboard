import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { PlacePicker } from "../components/PlacePicker.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Toast } from "../components/ui/Toast.jsx";
import { AirQualityCard } from "../components/weather/AirQualityCard.jsx";
import { DailyForecast } from "../components/weather/DailyForecast.jsx";
import { HourlyStrip } from "../components/weather/HourlyStrip.jsx";
import { SavedPlaceCards } from "../components/weather/SavedPlaceCards.jsx";
import { WeatherHero } from "../components/weather/WeatherHero.jsx";
import { useAuthContext } from "../context/AuthContext.jsx";
import { usePlaceSummaries, useWeather } from "../hooks/useWeather.js";
import { useSavedPlaces } from "../hooks/useSavedPlaces.js";
import { resolveHomeLocation } from "../utils/profileUpdate.js";
import { toActiveLocation } from "../utils/savedPlaces.js";
import { toSelectedLocation } from "../utils/selectedLocation.js";
import { evaluateAlerts } from "../weather/alerts.js";
import { buildChartPoints, buildDailyView, buildHeroView, buildHourlyView, rateUsAqi } from "../weather/display.js";
import { defaultUnits } from "../weather/units.js";

const WeatherTrendChart = lazy(() => import("../components/weather/WeatherTrendChart.jsx"));

export function DashboardPage() {
  const { user, profile, updateProfile } = useAuthContext();
  const [location, setLocation] = useState(() => resolveHomeLocation(profile));
  const [toast, setToast] = useState({ message: "", tone: "info" });
  const userMovedPinRef = useRef(false);
  const hydratedHomeRef = useRef(false);
  const units = profile?.units || defaultUnits();
  const weather = useWeather(location, { enabled: Boolean(user) });
  const saved = useSavedPlaces(user?.uid);
  const placeTemps = usePlaceSummaries(saved.places, { units });
  const home = resolveHomeLocation(profile);

  useEffect(() => {
    if (!profile || userMovedPinRef.current || hydratedHomeRef.current) {
      return;
    }
    setLocation(resolveHomeLocation(profile));
    hydratedHomeRef.current = true;
  }, [profile]);

  function selectLocation(next) {
    const selected = toSelectedLocation(next, location);
    if (!selected) {
      return;
    }
    userMovedPinRef.current = true;
    setLocation(selected);
  }

  async function setAsHome() {
    const result = await updateProfile({
      displayName: profile?.displayName || "",
      preferredLocation: location,
      units,
      notificationsEnabled: Boolean(profile?.notificationsEnabled),
    });
    if (!result?.ok) {
      setToast({ message: result?.message || "Could not save settings.", tone: "error" });
      return;
    }
    setToast({ message: "Home location saved.", tone: "info" });
  }

  async function savePlace() {
    const result = await saved.addPlace(location);
    if (!result?.ok) {
      setToast({ message: result?.message || "Could not save that place.", tone: "error" });
      return;
    }
    setToast({ message: "Place saved.", tone: "info" });
  }

  const nowIso = weather.forecast?.current?.time;
  const hero = useMemo(
    () =>
      weather.forecast
        ? buildHeroView({ location, forecast: weather.forecast, air: weather.air, units })
        : null,
    [location, weather.forecast, weather.air, units],
  );
  const hours = useMemo(
    () => (weather.forecast ? buildHourlyView(weather.forecast.hourly, units, nowIso, 24) : []),
    [weather.forecast, units, nowIso],
  );
  const days = useMemo(
    () => (weather.forecast ? buildDailyView(weather.forecast.daily, nowIso, units) : []),
    [weather.forecast, nowIso, units],
  );
  const chartPoints = useMemo(
    () => (weather.forecast ? buildChartPoints(weather.forecast.hourly, units, nowIso) : []),
    [weather.forecast, units, nowIso],
  );
  const alerts = evaluateAlerts({
    temperatureC: weather.forecast?.current?.temperature,
    weatherCode: weather.forecast?.current?.weatherCode,
    usAqi: weather.air?.usAqi,
  });

  const notice = saved.error || toast.message;
  const noticeTone = saved.error ? "error" : toast.tone;

  return (
    <section className="weather-board">
      <div className="weather-board-place">
        <article className="panel-card place-card">
          <p className="eyebrow">Selected place</p>
          <h2>{location.label}</h2>
          <p className="meta">
            {Number(location.lat).toFixed(2)}, {Number(location.lon).toFixed(2)}. Search recenters
            the map; the pin is the place we use.
          </p>
          <PlacePicker location={location} onPinChange={selectLocation} />
          <div className="place-actions">
            <button type="button" onClick={setAsHome}>
              Set as home
            </button>
            <button type="button" className="secondary" onClick={savePlace}>
              Save place
            </button>
          </div>
          <Toast message={notice} tone={noticeTone} />
        </article>
        <SavedPlaceCards
          places={saved.places}
          summaries={placeTemps.summaries}
          loading={placeTemps.status === "loading"}
          homeId={home.locationId}
          onSelect={(place) => selectLocation(toActiveLocation(place))}
        />
      </div>

      <div className="weather-board-now">
        {alerts.map((alert) => (
          <p key={alert.id} className="banner banner-error" role="alert">
            {alert.message}
          </p>
        ))}

        {weather.error && weather.forecast ? (
          <p className="banner banner-error" role="alert">
            {weather.error}
          </p>
        ) : null}

        {weather.status === "idle" || weather.status === "loading" ? (
          <div className="weather-board-grid">
            <article className="ui-card">
              <Skeleton lines={5} />
            </article>
            <article className="ui-card">
              <Skeleton lines={4} />
            </article>
          </div>
        ) : null}

        {weather.status === "error" && !weather.forecast ? (
          <EmptyState title="Could not load weather" body={weather.error} />
        ) : null}

        {weather.status === "ready" && weather.locationId === location.locationId && hero ? (
          <>
            <WeatherHero hero={hero} />
            <HourlyStrip hours={hours} />
            <Suspense fallback={<article className="ui-card"><Skeleton lines={4} /></article>}>
              <WeatherTrendChart points={chartPoints} />
            </Suspense>
            <DailyForecast days={days} />
            <AirQualityCard
              air={{
                ...weather.air,
                rating: rateUsAqi(weather.air?.usAqi),
              }}
            />
          </>
        ) : null}
      </div>
    </section>
  );
}
