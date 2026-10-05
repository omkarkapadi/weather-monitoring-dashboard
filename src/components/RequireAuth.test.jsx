import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { RequireAuth } from "./RequireAuth.jsx";

vi.mock("../context/AuthContext.jsx", () => ({
  useAuthContext: () => globalThis.__requireAuth,
}));

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={["/app"]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route path="/not-approved" element={<p>Not approved page</p>} />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <p>Private app</p>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAuth", () => {
  it("keeps /app closed until invite and profile are known", () => {
    globalThis.__requireAuth = {
      user: { uid: "u1" },
      authLoading: false,
      approved: undefined,
      profile: undefined,
      profileLoading: true,
    };
    renderGuard();
    expect(screen.getByText(/checking sign-in/i)).toBeInTheDocument();
    expect(screen.queryByText("Private app")).not.toBeInTheDocument();
  });

  it("sends an unapproved signed-in user to /not-approved", () => {
    globalThis.__requireAuth = {
      user: { uid: "u1" },
      authLoading: false,
      approved: false,
      profile: null,
      profileLoading: false,
    };
    renderGuard();
    expect(screen.getByText("Not approved page")).toBeInTheDocument();
    expect(screen.queryByText("Private app")).not.toBeInTheDocument();
  });

  it("renders the app for an approved member with a profile", () => {
    globalThis.__requireAuth = {
      user: { uid: "u1" },
      authLoading: false,
      approved: true,
      profile: { role: "member" },
      profileLoading: false,
    };
    renderGuard();
    expect(screen.getByText("Private app")).toBeInTheDocument();
  });

  it("does not send a lookup failure to the not-approved page", () => {
    globalThis.__requireAuth = {
      user: { uid: "u1" },
      authLoading: false,
      approved: undefined,
      profile: undefined,
      profileLoading: false,
      accessError: true,
    };
    renderGuard();
    expect(screen.getByRole("alert")).toHaveTextContent(/could not verify access/i);
    expect(screen.queryByText("Not approved page")).not.toBeInTheDocument();
    expect(screen.queryByText("Private app")).not.toBeInTheDocument();
  });
});
