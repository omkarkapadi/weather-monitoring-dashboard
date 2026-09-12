import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Login } from "./Login.jsx";

describe("Login", () => {
  it("shows a validation message when fields are empty", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();

    render(<Login onLogin={onLogin} onRegister={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/email and password/i);
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("calls onLogin with the typed credentials", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn().mockResolvedValue();

    render(<Login onLogin={onLogin} onRegister={vi.fn()} />);
    await user.type(screen.getByLabelText(/email/i), "demo@college.edu");
    await user.type(screen.getByLabelText(/password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(onLogin).toHaveBeenCalledWith("demo@college.edu", "secret1");
  });

  it("calls onRegister from the create-account button", async () => {
    const user = userEvent.setup();
    const onRegister = vi.fn().mockResolvedValue();

    render(<Login onLogin={vi.fn()} onRegister={onRegister} />);
    await user.type(screen.getByLabelText(/email/i), "new@college.edu");
    await user.type(screen.getByLabelText(/password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(onRegister).toHaveBeenCalledWith("new@college.edu", "secret1");
  });
});
