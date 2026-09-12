import { Navigate, Route, Routes } from "react-router-dom";
import { AdminRoute } from "./components/AdminRoute.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { RequireAuth } from "./components/RequireAuth.jsx";
import { RequireGuest } from "./components/RequireGuest.jsx";
import { AppShell } from "./layout/AppShell.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { AdminPage } from "./pages/AdminPage.jsx";
import { PlaceholderPage } from "./pages/PlaceholderPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";

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
          <Route path="settings" element={<SettingsPage />} />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/status"
            element={
              <AdminRoute>
                <PlaceholderPage
                  title="System status"
                  body="Ingest monitoring lands in Phase 13."
                />
              </AdminRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
