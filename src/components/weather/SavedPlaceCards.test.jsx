import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SavedPlaceCards } from "./SavedPlaceCards.jsx";

describe("SavedPlaceCards", () => {
  it("shows a temperature chip and marks the home place", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <SavedPlaceCards
        homeId="18.52,73.86"
        places={[
          { id: "18.52,73.86", label: "Pune", lat: 18.52, lon: 73.86 },
          { id: "18.51,73.81", label: "Kothrud", lat: 18.51, lon: 73.81 },
        ]}
        summaries={{
          "18.52,73.86": { temperature: "30°" },
          "18.51,73.81": { temperature: "29°" },
        }}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByText("30°")).toBeInTheDocument();
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /kothrud/i }));
    expect(onSelect).toHaveBeenCalledWith({
      id: "18.51,73.81",
      label: "Kothrud",
      lat: 18.51,
      lon: 73.81,
    });
  });
});
