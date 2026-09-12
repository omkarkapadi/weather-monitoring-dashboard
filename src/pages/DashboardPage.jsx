import { CurrentWeather } from "../components/CurrentWeather.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { WeatherChart } from "../components/WeatherChart.jsx";
import { useAuthContext } from "../context/AuthContext.jsx";
import { useReadings } from "../hooks/useReadings.js";

export function DashboardPage() {
  const { user } = useAuthContext();
  const readingsState = useReadings(Boolean(user));

  return (
    <section className="page-grid">
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
          Signed in, but Firestore has no readings yet. Run the Fetch weather GitHub
          Action once, then this page will update live.
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
