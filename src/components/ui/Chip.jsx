export function Chip({ children, className = "" }) {
  return <span className={`ui-chip ${className}`.trim()}>{children}</span>;
}
