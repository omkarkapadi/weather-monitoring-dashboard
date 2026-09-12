export function requireAuth(user, loading) {
  if (loading || user === undefined) {
    return { status: "loading", redirectTo: null };
  }
  if (!user) {
    return { status: "unauthenticated", redirectTo: "/login" };
  }
  return { status: "authenticated", redirectTo: null };
}

export function requireGuest(user, loading) {
  if (loading || user === undefined) {
    return { status: "loading", redirectTo: null };
  }
  if (user) {
    return { status: "authenticated", redirectTo: "/app" };
  }
  return { status: "guest", redirectTo: null };
}

const MEMBER_NAV = [
  { to: "/app", label: "Dashboard", end: true },
  { to: "/app/history", label: "History", end: false },
  { to: "/app/settings", label: "Settings", end: false },
];

const ADMIN_NAV = [
  { to: "/app/admin", label: "Admin", end: true },
  { to: "/app/admin/status", label: "Status", end: false },
];

export function getNavItems(role) {
  if (role === "admin") {
    return [...MEMBER_NAV, ...ADMIN_NAV];
  }
  return [...MEMBER_NAV];
}
