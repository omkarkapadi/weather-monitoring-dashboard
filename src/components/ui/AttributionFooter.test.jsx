import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttributionFooter } from "./AttributionFooter.jsx";

describe("AttributionFooter", () => {
  it("credits Open-Meteo and RainViewer", () => {
    render(<AttributionFooter />);
    expect(screen.getByRole("link", { name: /open-meteo/i })).toHaveAttribute(
      "href",
      "https://open-meteo.com/",
    );
    expect(screen.getByRole("link", { name: /rainviewer/i })).toHaveAttribute(
      "href",
      "https://www.rainviewer.com/",
    );
  });
});
