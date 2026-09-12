import { Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { RequireAuth } from "./components/RequireAuth.jsx";
import { RequireGuest } from "./components/RequireGuest.jsx";
import { AppShell } from "./layout/AppShell.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { PlaceholderPage } from "./pages/PlaceholderPage.jsx";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <RequireGuest>
              <LoginPage />
            </RequireGuest>
          }
        />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route
            path="history"
            element={
              <PlaceholderPage
                title="History"
                body="CSV export and a longer reading table land in a later phase."
              />
            }
          />
          <Route
            path="settings"
            element={
              <PlaceholderPage
                title="Settings"
                body="Display name, preferred city, and notification preferences land in Phase 9."
              />
            }
          />
          <Route
            path="admin"
            element={
              <PlaceholderPage
                title="Admin"
                body="Invite list and member roles land in Phase 8. This route is reserved so admin nav does not 404."
              />
            }
          />
          <Route
            path="admin/status"
            element={
              <PlaceholderPage
                title="System status"
                body="Ingest monitoring lands in Phase 13."
              />
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
