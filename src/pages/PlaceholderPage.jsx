export function PlaceholderPage({ title, body }) {
  return (
    <section className="panel-card">
      <p className="eyebrow">Coming next</p>
      <h2>{title}</h2>
      <p className="lede">{body}</p>
    </section>
  );
}
