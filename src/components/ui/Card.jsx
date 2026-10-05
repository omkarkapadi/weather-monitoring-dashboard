export function Card({ as: Tag = "article", className = "", children, ...props }) {
  return (
    <Tag className={`ui-card ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}
