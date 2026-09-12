import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    exclude: ["**/node_modules/**", "**/firestore.rules.test.js"],
    coverage: {
      provider: "v8",
      include: [
        "src/firebase.js",
        "src/utils/weatherMappers.js",
        "scripts/parseWeather.js",
        "scripts/fetchWeather.js",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 80,
      },
    },
  },
});
