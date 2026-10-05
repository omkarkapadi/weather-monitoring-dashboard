import { describe, expect, it } from "vitest";
import {
  SHELL_COMPACT_MAX_WIDTH,
  WORKSPACE_OVERFLOW_LOCK,
  applyWorkspaceOverflowLock,
  shellCompactMediaQuery,
} from "./viewport.js";

describe("shellCompactMediaQuery", () => {
  it("collapses the signed-in shell before the sidebar and session overflow a laptop window", () => {
    expect(SHELL_COMPACT_MAX_WIDTH).toBe(1100);
    expect(shellCompactMediaQuery()).toBe("(max-width: 1100px)");
  });
});

describe("applyWorkspaceOverflowLock", () => {
  it("locks the document so the signed-in desk cannot grow a page scrollbar", () => {
    const root = document.createElement("html");
    const unlock = applyWorkspaceOverflowLock(root);
    expect(root).toHaveClass(WORKSPACE_OVERFLOW_LOCK);
    unlock();
    expect(root).not.toHaveClass(WORKSPACE_OVERFLOW_LOCK);
  });
});
