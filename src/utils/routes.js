export function requireAuth(user, loading) {
  if (loading || user === undefined) {
    return { status: "loading", redirectTo: null };
  }
  if (!user) {
    return { status: "unauthenticated", redirectTo: "/login" };
  }
  return { status: "authenticated", redirectTo: null };
}

export function requireApprovedApp({
  user,
  authLoading,
  approved,
  profile,
  profileLoading,
  accessError,
}) {
  if (
    authLoading ||
    user === undefined ||
    profileLoading ||
    (user && approved === undefined && !accessError)
  ) {
    return { status: "loading", redirectTo: null };
  }
  if (!user) {
    return { status: "unauthenticated", redirectTo: "/login" };
  }
  if (accessError) {
    return { status: "error", redirectTo: null };
  }
  if (approved !== true) {
    return { status: "forbidden", redirectTo: "/not-approved" };
  }
  if (!profile) {
    return { status: "forbidden", redirectTo: "/not-approved" };
  }
  return { status: "ok", redirectTo: null };
}

export function requireGuest(user, loading, approved) {
  if (loading || user === undefined || (user && approved === undefined)) {
    return { status: "loading", redirectTo: null };
  }
  if (user && approved) {
    return { status: "authenticated", redirectTo: "/app" };
  }
  return { status: "guest", redirectTo: null };
}

const MEMBER_NAV = [
  { to: "/app", label: "Dashboard", end: true },
  { to: "/app/map", label: "Map", end: false },
  { to: "/app/history", label: "History", end: false },
  { to: "/app/settings", label: "Settings", end: false },
];

const ADMIN_NAV = [
  { to: "/app/admin", label: "Admin", end: true },
  { to: "/app/admin/status", label: "Status", end: false },
];

export function requireAdmin(role, profileLoading) {
  if (profileLoading) {
    return { status: "loading", redirectTo: null };
  }
  if (role !== "admin") {
    return { status: "forbidden", redirectTo: "/app" };
  }
  return { status: "ok", redirectTo: null };
}

export function getNavItems(role) {
  if (role === "admin") {
    return [...MEMBER_NAV, ...ADMIN_NAV];
  }
  return [...MEMBER_NAV];
}
