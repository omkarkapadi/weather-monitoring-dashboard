import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY, applyTheme, readThemePreference } from "../../weather/theme.js";

const OPTIONS = [
  { id: "system", label: "System" },
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
];

export function ThemeToggle() {
  const [preference, setPreference] = useState(() =>
    typeof window === "undefined" ? "system" : readThemePreference(),
  );

  useEffect(() => {
    applyTheme(preference);
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  }, [preference]);

  return (
    <label className="theme-toggle">
      <span className="theme-toggle-label">Theme</span>
      <select
        aria-label="Color theme"
        value={preference}
        onChange={(event) => setPreference(event.target.value)}
      >
        {OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
