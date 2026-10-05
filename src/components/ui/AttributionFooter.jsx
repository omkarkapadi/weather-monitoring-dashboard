export function AttributionFooter() {
  return (
    <footer className="attribution-footer">
      Weather data by{" "}
      <a href="https://open-meteo.com/" rel="noreferrer">
        Open-Meteo
      </a>{" "}
      (CC BY 4.0). Radar by{" "}
      <a href="https://www.rainviewer.com/" rel="noreferrer">
        RainViewer
      </a>
      . Map ©{" "}
      <a href="https://www.openstreetmap.org/copyright" rel="noreferrer">
        OpenStreetMap
      </a>
    </footer>
  );
}
