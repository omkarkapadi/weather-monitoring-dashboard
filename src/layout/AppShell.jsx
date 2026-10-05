import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { AttributionFooter } from "../components/ui/AttributionFooter.jsx";
import { ThemeToggle } from "../components/ui/ThemeToggle.jsx";
import { useAuthContext } from "../context/AuthContext.jsx";
import { getNavItems } from "../utils/routes.js";
import { applyWorkspaceOverflowLock, shellCompactMediaQuery } from "./viewport.js";

function readCompactShell() {
  if (typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(shellCompactMediaQuery()).matches;
}

export function AppShell() {
  const { user, logout, role } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(readCompactShell);
  const navRole = role || "member";
  const navItems = getNavItems(navRole);
  const drawerInert = isMobile && !menuOpen;

  useEffect(() => applyWorkspaceOverflowLock(), []);

  useEffect(() => {
    const media = window.matchMedia(shellCompactMediaQuery());
    const update = () => {
      const mobile = media.matches;
      setIsMobile(mobile);
      if (!mobile) {
        setMenuOpen(false);
      }
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <div className="workspace">
      {menuOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
      <aside
        id="sidebar-nav"
        className={`sidebar ${menuOpen ? "is-open" : ""}`}
        aria-hidden={drawerInert}
        inert={drawerInert || undefined}
      >
        <div className="brand">
          <p className="eyebrow">Weather Monitor</p>
          <strong>Operations</strong>
        </div>
        <nav aria-label="Main">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "nav-link is-active" : "nav-link")}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="workspace-main">
        <header className="workspace-topbar">
          <button
            type="button"
            className="menu-toggle secondary"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="sidebar-nav"
            aria-label="Toggle navigation"
          >
            Menu
          </button>
          <div>
            <p className="eyebrow">Internal dashboard</p>
            <h1>Weather desk</h1>
          </div>
          <div className="session">
            <ThemeToggle />
            <p className="session-email" title={user?.email}>
              {user?.email}
            </p>
            <span className="role-pill">{navRole}</span>
            <button type="button" className="secondary" onClick={logout}>
              Log out
            </button>
          </div>
        </header>
        <main className="workspace-content">
          <Outlet />
        </main>
        <AttributionFooter />
      </div>
    </div>
  );
}
