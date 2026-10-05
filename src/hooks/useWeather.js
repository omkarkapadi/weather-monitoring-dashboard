import { useEffect, useState } from "react";
import { WeatherCache, FORECAST_TTL_MS } from "../weather/cache.js";
import { formatTemp } from "../weather/display.js";
import { httpErrorMessage, requestJson } from "../weather/http.js";
import { isValidCoords, toLocationId } from "../weather/locationId.js";
import { buildAirQualityUrl, buildForecastUrl, normalizeAirQuality, normalizeForecast } from "../weather/openMeteo.js";

export const REFRESH_MS = 10 * 60 * 1000;

let sharedCache;

export function getWeatherCache() {
  if (!sharedCache) {
    sharedCache = new WeatherCache({
      storage: typeof localStorage === "undefined" ? null : localStorage,
    });
  }
  return sharedCache;
}

export function weatherCacheKey(kind, locationId) {
  return `om:${kind}:${locationId}`;
}

export function shouldRefresh(lastFetchedAt, now, visible) {
  return Boolean(visible) && now - lastFetchedAt >= REFRESH_MS;
}

export async function loadWeather({ location, cache, fetchFn = fetch, force = false }) {
  if (!isValidCoords(location?.lat, location?.lon)) {
    return { ok: false, message: "Drop a pin on the map to load weather." };
  }

  const locationId = location.locationId || toLocationId(location.lat, location.lon);
  const forecastKey = weatherCacheKey("forecast", locationId);
  const airKey = weatherCacheKey("aq", locationId);
  const cachedForecast = force ? null : cache.get(forecastKey);
  const cachedAir = force ? null : cache.get(airKey);

  if (cachedForecast) {
    return { ok: true, forecast: cachedForecast, air: cachedAir, fromCache: true, locationId };
  }

  try {
    const [forecastPayload, airPayload] = await Promise.all([
      requestJson(buildForecastUrl(location), { fetchFn, retries: 0 }),
      requestJson(buildAirQualityUrl(location), { fetchFn, retries: 0 }),
    ]);
    const forecast = normalizeForecast(forecastPayload);
    const air = normalizeAirQuality(airPayload);
    cache.set(forecastKey, forecast, FORECAST_TTL_MS);
    cache.set(airKey, air, FORECAST_TTL_MS);
    return { ok: true, forecast, air, fromCache: false, locationId };
  } catch (error) {
    return { ok: false, message: httpErrorMessage(error) };
  }
}

export function usePlaceSummaries(places, { cache = getWeatherCache(), fetchFn = fetch, units } = {}) {
  const [summaries, setSummaries] = useState({});
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    let cancelled = false;
    if (!places?.length) {
      setSummaries({});
      setStatus("idle");
      return undefined;
    }

    setStatus("loading");
    Promise.all(
      places.map(async (place) => {
        const result = await loadWeather({
          location: { ...place, locationId: place.id || place.locationId },
          cache,
          fetchFn,
        });
        return [
          place.id,
          {
            temperature: result.ok
              ? formatTemp(result.forecast.current.temperature, units?.temperature)
              : "—",
          },
        ];
      }),
    ).then((entries) => {
      if (!cancelled) {
        setSummaries(Object.fromEntries(entries));
        setStatus("ready");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [places, cache, fetchFn, units?.temperature]);

  return { summaries, status };
}

export function useWeather(location, { enabled = true, cache = getWeatherCache(), fetchFn = fetch } = {}) {
  const [state, setState] = useState({
    status: enabled ? "loading" : "idle",
    forecast: null,
    air: null,
    error: "",
    fetchedAt: 0,
    locationId: "",
  });

  useEffect(() => {
    if (!enabled) {
      setState({ status: "idle", forecast: null, air: null, error: "", fetchedAt: 0, locationId: "" });
      return undefined;
    }

    let cancelled = false;
    const nextId = location?.locationId || "";
    setState((current) => ({
      status: "loading",
      forecast: current.locationId === nextId ? current.forecast : null,
      air: current.locationId === nextId ? current.air : null,
      error: "",
      fetchedAt: current.locationId === nextId ? current.fetchedAt : 0,
      locationId: current.locationId === nextId ? current.locationId : "",
    }));

    async function run(force) {
      const result = await loadWeather({ location, cache, fetchFn, force });
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setState((current) => ({
          ...current,
          status: current.forecast ? "ready" : "error",
          error: result.message,
        }));
        return;
      }
      setState({
        status: "ready",
        forecast: result.forecast,
        air: result.air,
        error: "",
        fetchedAt: Date.now(),
        locationId: result.locationId,
      });
    }

    run(false);

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        run(true);
      }
    }, REFRESH_MS);

    function onVisibility() {
      if (document.visibilityState === "visible") {
        run(false);
      }
    }

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, location?.locationId, location?.lat, location?.lon, cache, fetchFn]);

  return state;
}
