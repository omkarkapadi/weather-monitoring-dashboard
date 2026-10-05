export const SHELL_COMPACT_MAX_WIDTH = 1100;
export const WORKSPACE_OVERFLOW_LOCK = "workspace-lock";

export function shellCompactMediaQuery(maxWidth = SHELL_COMPACT_MAX_WIDTH) {
  return `(max-width: ${maxWidth}px)`;
}

export function applyWorkspaceOverflowLock(root = document.documentElement) {
  root.classList.add(WORKSPACE_OVERFLOW_LOCK);
  return () => {
    root.classList.remove(WORKSPACE_OVERFLOW_LOCK);
  };
}
