import { WeatherCache } from "./cache.js";
import { httpErrorMessage, requestJson } from "./http.js";

export const RAINVIEWER_MAPS_URL = "https://api.rainviewer.com/public/weather-maps.json";
export const RADAR_TTL_MS = 5 * 60 * 1000;
export const RADAR_PLAY_MS = 500;
export const RADAR_CACHE_KEY = "rv:weather-maps";

export function normalizeRadarFrames(payload) {
  const host = String(payload?.host || "").replace(/\/$/, "");
  const past = Array.isArray(payload?.radar?.past) ? payload.radar.past : [];
  const nowcast = Array.isArray(payload?.radar?.nowcast) ? payload.radar.nowcast : [];
  const frames = [...past, ...nowcast]
    .filter((frame) => frame?.path)
    .map((frame) => ({
      time: Number(frame.time) || 0,
      path: String(frame.path),
    }));

  return {
    host,
    frames,
    latestPastIndex: past.length > 0 ? past.length - 1 : 0,
  };
}

export function buildRadarTileUrl({ host, path, size = 256, color = 2, options = "1_1" }) {
  return `${host}${path}/${size}/{z}/{x}/{y}/${color}/${options}.png`;
}

export function formatRadarTime(unix, { clock = "12h", timeZone = "UTC" } = {}) {
  if (!Number.isFinite(unix) || unix <= 0) {
    return "unknown time";
  }
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: clock !== "24h",
    timeZone,
    timeZoneName: "short",
  }).format(new Date(unix * 1000));
}

export function nextFrameIndex(index, length) {
  if (!length) {
    return 0;
  }
  return (Number(index) + 1) % length;
}

export function radarSummary({ frames = [], index = 0, playing = false, clock = "12h" } = {}) {
  if (!frames.length) {
    return "No radar frames available.";
  }
  const safeIndex = Math.min(Math.max(0, index), frames.length - 1);
  const stamp = formatRadarTime(frames[safeIndex].time, { clock, timeZone: "UTC" });
  const playState = playing ? ", playing" : "";
  return `Radar frame ${safeIndex + 1} of ${frames.length} at ${stamp}${playState}.`;
}

export async function loadRadarMaps({ cache, fetchFn = fetch } = {}) {
  const store = cache || new WeatherCache({ storage: null });
  const cached = store.get(RADAR_CACHE_KEY);
  if (cached) {
    return { ok: true, ...cached, fromCache: true };
  }

  try {
    const payload = await requestJson(RAINVIEWER_MAPS_URL, { fetchFn });
    const normalized = normalizeRadarFrames(payload);
    store.set(RADAR_CACHE_KEY, normalized, RADAR_TTL_MS);
    return { ok: true, ...normalized, fromCache: false };
  } catch (error) {
    return {
      ok: false,
      message: httpErrorMessage(error),
      host: "",
      frames: [],
      latestPastIndex: 0,
      fromCache: false,
    };
  }
}
