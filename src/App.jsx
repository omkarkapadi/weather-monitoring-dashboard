import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminRoute } from "./components/AdminRoute.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { RequireAuth } from "./components/RequireAuth.jsx";
import { RequireGuest } from "./components/RequireGuest.jsx";
import { Skeleton } from "./components/Skeleton.jsx";
import { AppShell } from "./layout/AppShell.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { AdminPage } from "./pages/AdminPage.jsx";
import { PlaceholderPage } from "./pages/PlaceholderPage.jsx";
import { NotApprovedPage } from "./pages/NotApprovedPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";

const MapPage = lazy(() => import("./pages/MapPage.jsx"));
const HistoryPage = lazy(() => import("./pages/HistoryPage.jsx"));

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
        <Route path="/not-approved" element={<NotApprovedPage />} />
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
            path="map"
            element={
              <Suspense fallback={<article className="panel-card"><Skeleton lines={4} /></article>}>
                <MapPage />
              </Suspense>
            }
          />
          <Route
            path="history"
            element={
              <Suspense fallback={<article className="panel-card"><Skeleton lines={4} /></article>}>
                <HistoryPage />
              </Suspense>
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
