import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell.jsx";
import { WORKSPACE_OVERFLOW_LOCK, shellCompactMediaQuery } from "./viewport.js";

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

const originalMatchMedia = window.matchMedia;

function mockMatchMedia(matches) {
  const listeners = new Set();
  const media = {
    matches,
    media: shellCompactMediaQuery(),
    addEventListener: vi.fn((_, listener) => listeners.add(listener)),
    removeEventListener: vi.fn((_, listener) => listeners.delete(listener)),
    dispatch(nextMatches) {
      media.matches = nextMatches;
      listeners.forEach((listener) => listener());
    },
  };
  window.matchMedia = vi.fn().mockReturnValue(media);
  return media;
}

describe("AppShell mobile drawer", () => {
  beforeEach(() => {
    mockMatchMedia(true);
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("fits the session cluster to the top bar instead of pushing it off-screen", () => {
    renderShell();

    expect(window.matchMedia).toHaveBeenCalledWith(shellCompactMediaQuery());
    expect(screen.getByText("demo@college.edu")).toHaveClass("session-email");
    expect(screen.getByText("demo@college.edu")).toHaveAttribute("title", "demo@college.edu");
  });

  it("locks the document while the desk is open so Chrome cannot show a page scrollbar", () => {
    const { unmount } = renderShell();
    expect(document.documentElement).toHaveClass(WORKSPACE_OVERFLOW_LOCK);
    unmount();
    expect(document.documentElement).not.toHaveClass(WORKSPACE_OVERFLOW_LOCK);
  });

  it("keeps a closed compact drawer out of the tab order", () => {
    renderShell();

    const aside = document.getElementById("sidebar-nav");
    expect(aside).toHaveAttribute("inert");
    expect(aside).toHaveAttribute("aria-hidden", "true");
  });

  it("closes the compact drawer with Escape", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole("button", { name: /toggle navigation/i }));
    expect(document.getElementById("sidebar-nav")).not.toHaveAttribute("inert");

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("button", { name: /close navigation/i })).not.toBeInTheDocument();
    expect(document.getElementById("sidebar-nav")).toHaveAttribute("inert");
  });

  it("leaves the sidebar in the tab order on a wide desk", () => {
    mockMatchMedia(false);
    renderShell();

    const aside = document.getElementById("sidebar-nav");
    expect(aside).not.toHaveAttribute("inert");
    expect(aside).toHaveAttribute("aria-hidden", "false");
    expect(screen.getByRole("link", { name: /history/i })).toBeVisible();
  });

  it("closes an open drawer when the window grows past the compact breakpoint", async () => {
    const media = mockMatchMedia(true);
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole("button", { name: /toggle navigation/i }));
    expect(screen.getByRole("button", { name: /close navigation/i })).toBeInTheDocument();

    act(() => {
      media.dispatch(false);
    });

    expect(screen.queryByRole("button", { name: /close navigation/i })).not.toBeInTheDocument();
    expect(document.getElementById("sidebar-nav")).not.toHaveAttribute("inert");
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
