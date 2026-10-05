import { useEffect, useState } from "react";
import { getWeatherCache, weatherCacheKey } from "./useWeather.js";
import { validateArchiveRange } from "../weather/archiveRange.js";
import { httpErrorMessage, requestJson } from "../weather/http.js";
import { isValidCoords, toLocationId } from "../weather/locationId.js";
import { buildArchiveUrl, normalizeArchive } from "../weather/openMeteo.js";

export const ARCHIVE_TTL_MS = 60 * 60 * 1000;

export async function loadArchive({
  location,
  range,
  cache,
  fetchFn = fetch,
  now = new Date(),
}) {
  const checked = validateArchiveRange(range?.start, range?.end, now);
  if (!checked.ok) {
    return checked;
  }
  if (!isValidCoords(location?.lat, location?.lon)) {
    return { ok: false, message: "Set a home place in Settings to load history." };
  }

  const locationId = location.locationId || toLocationId(location.lat, location.lon);
  const key = weatherCacheKey("archive", `${locationId}:${checked.start}:${checked.end}`);
  const cached = cache.get(key);
  if (cached) {
    return { ok: true, ...cached, fromCache: true, range: checked };
  }

  try {
    const payload = await requestJson(
      buildArchiveUrl({
        lat: location.lat,
        lon: location.lon,
        start: checked.start,
        end: checked.end,
      }),
      { fetchFn, retries: 0 },
    );
    const archive = normalizeArchive(payload);
    cache.set(key, archive, ARCHIVE_TTL_MS);
    return { ok: true, ...archive, fromCache: false, range: checked };
  } catch (error) {
    return { ok: false, message: httpErrorMessage(error) };
  }
}

export function useArchive(
  location,
  range,
  { enabled = true, cache = getWeatherCache(), fetchFn = fetch } = {},
) {
  const [state, setState] = useState({
    status: enabled ? "loading" : "idle",
    days: [],
    error: "",
    range: range || { start: "", end: "" },
  });

  useEffect(() => {
    if (!enabled) {
      setState({ status: "idle", days: [], error: "", range: range || { start: "", end: "" } });
      return undefined;
    }

    let cancelled = false;
    setState((current) => ({ ...current, status: "loading", error: "" }));

    loadArchive({ location, range, cache, fetchFn }).then((result) => {
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setState({
          status: "error",
          days: [],
          error: result.message,
          range: range || { start: "", end: "" },
        });
        return;
      }
      setState({
        status: "ready",
        days: result.days,
        error: "",
        range: result.range,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, location?.locationId, location?.lat, location?.lon, range?.start, range?.end, cache, fetchFn]);

  return state;
}
