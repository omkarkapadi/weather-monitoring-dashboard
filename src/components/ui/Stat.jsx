export function Stat({ label, value }) {
  return (
    <div className="ui-stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
