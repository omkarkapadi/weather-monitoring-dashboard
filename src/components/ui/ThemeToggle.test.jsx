import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeToggle } from "./ThemeToggle.jsx";

describe("ThemeToggle", () => {
  it("lets the user switch to the light theme", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.selectOptions(screen.getByLabelText(/color theme/i), "light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
