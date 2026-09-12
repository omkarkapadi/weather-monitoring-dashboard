import { CurrentWeather } from "./components/CurrentWeather.jsx";
import { Login } from "./components/Login.jsx";
import { WeatherChart } from "./components/WeatherChart.jsx";
import { useAuth } from "./hooks/useAuth.js";
import { useReadings } from "./hooks/useReadings.js";

export default function App() {
  const { user, error, pending, loading, login, register, logout } = useAuth();
  const readingsState = useReadings(Boolean(user));
  const city = import.meta.env.VITE_WEATHER_CITY || "Pune";

  if (loading) {
    return (
      <main className="centered">
        <p>Checking sign-in…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="auth-shell">
        <Login onLogin={login} onRegister={register} error={error} pending={pending} />
      </main>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Real-time weather dashboard</p>
          <h1>{city} monitor</h1>
        </div>
        <div className="session">
          <p>{user.email}</p>
          <button type="button" className="secondary" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {readingsState.status === "loading" ? (
        <p className="banner">Loading readings from Firestore…</p>
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

      <section className="dashboard">
        <CurrentWeather reading={readingsState.latest} />
        <WeatherChart readings={readingsState.readings} />
      </section>
    </div>
  );
}
