export function Skeleton({ className = "", lines = 3 }) {
  return (
    <div className={`skeleton-block ${className}`} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <span key={index} className="skeleton-line" />
      ))}
    </div>
  );
}
