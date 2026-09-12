import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AdminRoute } from "./AdminRoute.jsx";

vi.mock("../context/AuthContext.jsx", () => ({
  useAuthContext: () => globalThis.__adminRouteAuth,
}));

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={["/app/admin"]}>
      <Routes>
        <Route path="/app" element={<p>Dashboard page</p>} />
        <Route
          path="/app/admin"
          element={
            <AdminRoute>
              <p>Admin secret</p>
            </AdminRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AdminRoute", () => {
  it("waits while the profile is loading", () => {
    globalThis.__adminRouteAuth = { role: "member", loading: true };
    renderGuard();
    expect(screen.getByText(/checking admin access/i)).toBeInTheDocument();
    expect(screen.queryByText("Admin secret")).not.toBeInTheDocument();
  });

  it("redirects members to the dashboard", () => {
    globalThis.__adminRouteAuth = { role: "member", loading: false };
    renderGuard();
    expect(screen.getByText("Dashboard page")).toBeInTheDocument();
    expect(screen.queryByText("Admin secret")).not.toBeInTheDocument();
  });

  it("renders admin children", () => {
    globalThis.__adminRouteAuth = { role: "admin", loading: false };
    renderGuard();
    expect(screen.getByText("Admin secret")).toBeInTheDocument();
  });
});
