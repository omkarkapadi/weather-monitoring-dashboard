import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { formatGeocodeResult, formatNominatimResult, buildGeocodeUrl, buildNominatimUrl } from "../weather/openMeteo.js";
import { requestJson } from "../weather/http.js";
import { isValidCoords } from "../weather/locationId.js";
import { toSelectedLocation } from "../utils/selectedLocation.js";
import { Toast } from "./ui/Toast.jsx";

const PlaceMap = lazy(() => import("./PlaceMap.jsx"));

function usablePlaces(places) {
  return places.filter((place) => place.label && isValidCoords(place.lat, place.lon));
}

export async function searchPlaces(query, fetchFn) {
  let results = [];
  try {
    const payload = await requestJson(buildGeocodeUrl(query), { fetchFn });
    results = usablePlaces((payload?.results || []).map(formatGeocodeResult));
  } catch {
    results = [];
  }
  if (results.length > 0) {
    return results;
  }

  const fallback = await requestJson(buildNominatimUrl(query), { fetchFn });
  const rows = Array.isArray(fallback) ? fallback : [];
  return usablePlaces(rows.map(formatNominatimResult));
}

export function PlacePicker({
  location,
  onPinChange,
  onSearch = searchPlaces,
  geolocate = defaultGeolocate,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [geoError, setGeoError] = useState("");
  const [searchError, setSearchError] = useState("");
  const skipSearchRef = useRef(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return undefined;
    }

    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setSearchError("");
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const next = await onSearch(term);
        if (!cancelled) {
          setResults(next);
          setActiveIndex(0);
          setSearchError("");
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setSearchError("Could not search for places. Drop a pin on the map instead.");
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, onSearch]);

  useEffect(() => {
    function onPointerDown(event) {
      if (!searchRef.current?.contains(event.target)) {
        setResults([]);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function emitPin(next) {
    const selected = toSelectedLocation(next, location);
    if (!selected) {
      return;
    }
    onPinChange(selected);
  }

  function pickResult(result) {
    skipSearchRef.current = true;
    emitPin(result);
    setQuery(result.label);
    setResults([]);
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Escape") {
      setResults([]);
      return;
    }
    if (!results.length) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      pickResult(results[activeIndex] || results[0]);
    }
  }

  async function useMyLocation() {
    setGeoError("");
    try {
      const coords = await geolocate();
      emitPin(coords);
    } catch {
      setGeoError("Location permission was denied. Drop a pin on the map instead.");
    }
  }

  function updateCoord(field, raw) {
    emitPin({
      lat: field === "lat" ? Number(raw) : location?.lat,
      lon: field === "lon" ? Number(raw) : location?.lon,
    });
  }

  return (
    <div className="place-picker">
      <div className="place-search" ref={searchRef}>
        <label htmlFor="place-search">Search for a place</label>
        <input
          id="place-search"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="place-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={results.length ? `place-option-${activeIndex}` : undefined}
          aria-haspopup="listbox"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          autoComplete="off"
          placeholder="Kothrud, Pune"
        />
        <p className="visually-hidden" aria-live="polite">
          {results.length ? `${results.length} matching places` : ""}
        </p>
        <ul
          id="place-suggestions"
          className="place-results"
          role="listbox"
          hidden={results.length === 0}
        >
          {results.map((result, index) => (
            <li
              key={`${result.label}-${result.lat}-${result.lon}`}
              id={`place-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={index === activeIndex ? "is-active" : undefined}
              onClick={() => pickResult(result)}
            >
              <span className="place-result-pin" aria-hidden="true" />
              <span>{result.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <Toast message={searchError} tone="error" />
      <p id="place-map-help" className="meta">
        Matching places appear under the search box. Pick one to recenter; the pin is the place we
        use.
      </p>
      <div className="coord-fields">
        <label htmlFor="place-lat">
          Latitude
          <input
            id="place-lat"
            type="number"
            step="any"
            min="-90"
            max="90"
            value={Number.isFinite(location?.lat) ? location.lat : ""}
            onChange={(event) => updateCoord("lat", event.target.value)}
          />
        </label>
        <label htmlFor="place-lon">
          Longitude
          <input
            id="place-lon"
            type="number"
            step="any"
            min="-180"
            max="180"
            value={Number.isFinite(location?.lon) ? location.lon : ""}
            onChange={(event) => updateCoord("lon", event.target.value)}
          />
        </label>
      </div>
      <button type="button" className="secondary" onClick={useMyLocation}>
        Use my location
      </button>
      {geoError ? (
        <p className="banner banner-error" role="alert">
          {geoError}
        </p>
      ) : null}
      <Suspense fallback={<p className="meta">Loading map…</p>}>
        <PlaceMap
          lat={location.lat}
          lon={location.lon}
          onPinChange={(coords) => emitPin(coords)}
        />
      </Suspense>
    </div>
  );
}

function defaultGeolocate() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => reject(new Error("denied")),
    );
  });
}
