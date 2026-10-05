import "@testing-library/jest-dom/vitest";

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: query.includes("dark"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
}
