export function SavedPlaceCards({
  places,
  summaries = {},
  loading = false,
  homeId,
  onSelect,
  onRemove,
}) {
  if (!places?.length) {
    return null;
  }

  return (
    <section className="saved-place-board">
      <p className="eyebrow">Saved places</p>
      <ul className="saved-place-cards">
        {places.map((place) => {
          const isHome = place.id === homeId;
          const summary = summaries[place.id] || {};
          return (
            <li key={place.id}>
              <button type="button" className={isHome ? "is-home" : undefined} onClick={() => onSelect(place)}>
                <span className="saved-place-label">{place.label}</span>
                <strong>{summary.temperature || (loading ? "…" : "—")}</strong>
                {isHome ? <span className="saved-place-home">Home</span> : null}
              </button>
              {onRemove ? (
                <button
                  type="button"
                  className="secondary saved-place-remove"
                  onClick={() => onRemove(place)}
                >
                  Remove {place.label}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
