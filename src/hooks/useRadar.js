import { useEffect, useState } from "react";
import { getWeatherCache } from "./useWeather.js";
import {
  RADAR_PLAY_MS,
  buildRadarTileUrl,
  loadRadarMaps,
  nextFrameIndex,
  radarSummary,
} from "../weather/rainViewer.js";

export function useRadar({ cache = getWeatherCache(), fetchFn = fetch } = {}) {
  const [state, setState] = useState({
    status: "loading",
    host: "",
    frames: [],
    latestPastIndex: 0,
    error: "",
  });
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [opacity, setOpacity] = useState(0.7);

  useEffect(() => {
    let cancelled = false;
    loadRadarMaps({ cache, fetchFn }).then((result) => {
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setState({
          status: "error",
          host: "",
          frames: [],
          latestPastIndex: 0,
          error: result.message,
        });
        return;
      }
      setState({
        status: "ready",
        host: result.host,
        frames: result.frames,
        latestPastIndex: result.latestPastIndex,
        error: "",
      });
      setIndex(result.latestPastIndex);
    });
    return () => {
      cancelled = true;
    };
  }, [cache, fetchFn]);

  useEffect(() => {
    if (!playing || state.frames.length === 0) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setIndex((current) => nextFrameIndex(current, state.frames.length));
    }, RADAR_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [playing, state.frames.length]);

  const frame = state.frames[index];
  const tileUrl = frame ? buildRadarTileUrl({ host: state.host, path: frame.path }) : "";

  return {
    ...state,
    index,
    setIndex,
    playing,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    opacity,
    setOpacity,
    tileUrl,
    summary: radarSummary({ frames: state.frames, index, playing }),
  };
}
