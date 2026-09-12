import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell.jsx";

vi.mock("../context/AuthContext.jsx", () => ({
  useAuthContext: () => ({
    user: { email: "demo@college.edu" },
    role: "member",
    logout: vi.fn(),
  }),
}));

function renderShell() {
  return render(
    <MemoryRouter initialEntries={["/app"]}>
      <Routes>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<p>Dashboard content</p>} />
          <Route path="history" element={<p>History content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("AppShell mobile drawer", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes("800px"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  it("opens as an overlay and closes from the backdrop without removing dashboard content", async () => {
    const user = userEvent.setup();
    renderShell();

    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /close navigation/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /toggle navigation/i }));
    expect(screen.getByRole("button", { name: /close navigation/i })).toBeInTheDocument();
    expect(screen.getByText("Dashboard content")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close navigation/i }));
    expect(screen.queryByRole("button", { name: /close navigation/i })).not.toBeInTheDocument();
    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
  });

  it("closes the drawer when a nav link is tapped", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole("button", { name: /toggle navigation/i }));
    await user.click(screen.getByRole("link", { name: /history/i }));

    expect(screen.queryByRole("button", { name: /close navigation/i })).not.toBeInTheDocument();
    expect(screen.getByText("History content")).toBeInTheDocument();
  });
});
