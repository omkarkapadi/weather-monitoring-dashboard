import { useEffect, useState } from "react";
import { CurrentWeather } from "../components/CurrentWeather.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { WeatherChart } from "../components/WeatherChart.jsx";
import { useAuthContext } from "../context/AuthContext.jsx";
import { useIngestCities } from "../hooks/useIngestCities.js";
import { useReadings } from "../hooks/useReadings.js";
import { mergeCityOptions, resolveSelectedCity, selectedCityOrDefault } from "../utils/cities.js";

export function DashboardPage() {
  const { user, profile } = useAuthContext();
  const ingest = useIngestCities(Boolean(user));
  const preferred = selectedCityOrDefault(profile?.preferredCity);
  const [selectedCity, setSelectedCity] = useState(() =>
    resolveSelectedCity(profile?.preferredCity, ingest.cities),
  );
  const cityOptions = mergeCityOptions(preferred, [...ingest.cities, selectedCity]);
  const readingsState = useReadings(Boolean(user), selectedCity);

  useEffect(() => {
    setSelectedCity(resolveSelectedCity(profile?.preferredCity, ingest.cities));
  }, [profile?.preferredCity]);

  useEffect(() => {
    setSelectedCity((current) => resolveSelectedCity(current, ingest.cities, current));
  }, [ingest.cities]);

  return (
    <section className="page-grid">
      <div className="city-toolbar">
        <label htmlFor="dashboard-city">City</label>
        <select
          id="dashboard-city"
          value={selectedCity}
          onChange={(event) => setSelectedCity(event.target.value)}
        >
          {cityOptions.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {readingsState.status === "loading" ? (
        <div className="card-grid">
          <article className="panel-card">
            <Skeleton lines={4} />
          </article>
          <article className="panel-card">
            <Skeleton lines={5} />
          </article>
        </div>
      ) : null}

      {readingsState.status === "empty" ? (
        <p className="banner">
          Signed in, but Firestore has no {selectedCity} readings yet. Run the Fetch weather
          GitHub Action once, then this page will update live.
        </p>
      ) : null}

      {readingsState.status === "error" ? (
        <p className="banner banner-error" role="alert">
          {readingsState.error}
        </p>
      ) : null}

      {readingsState.status === "ready" || readingsState.status === "empty" ? (
        <div className="card-grid">
          <CurrentWeather reading={readingsState.latest} />
          <WeatherChart readings={readingsState.readings} />
        </div>
      ) : null}
    </section>
  );
}
