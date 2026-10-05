export const THEME_STORAGE_KEY = "weather-theme";

export function resolveTheme(preference, systemDark) {
  if (preference === "light" || preference === "dark") {
    return preference;
  }
  return systemDark ? "dark" : "light";
}

export function readThemePreference(storage = window.localStorage) {
  return storage.getItem(THEME_STORAGE_KEY) || "system";
}

export function applyTheme(preference, root = document.documentElement) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = resolveTheme(preference, systemDark);
  root.dataset.theme = resolved;
  root.dataset.themePreference = preference;
  root.style.colorScheme = resolved;
}
