export function EmptyState({ title, body }) {
  return (
    <div className="ui-empty">
      <h2>{title}</h2>
      {body ? <p className="lede">{body}</p> : null}
    </div>
  );
}
