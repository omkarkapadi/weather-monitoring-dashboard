import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { CITY_MAP_ZOOM, nextMapZoom, shouldResetCityZoom } from "../weather/mapView.js";

const icon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function PlaceMap({ lat, lon, onPinChange }) {
  const nodeRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onPinChangeRef = useRef(onPinChange);
  onPinChangeRef.current = onPinChange;

  useEffect(() => {
    if (!nodeRef.current || mapRef.current) {
      return undefined;
    }

    const map = L.map(nodeRef.current).setView([lat, lon], CITY_MAP_ZOOM);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker([lat, lon], { icon, draggable: true }).addTo(map);
    marker.on("dragend", () => {
      const next = marker.getLatLng();
      onPinChangeRef.current({ lat: next.lat, lon: next.lng });
    });
    map.on("click", (event) => {
      marker.setLatLng(event.latlng);
      onPinChangeRef.current({ lat: event.latlng.lat, lon: event.latlng.lng });
    });

    mapRef.current = map;
    markerRef.current = marker;
    const frame = window.requestAnimationFrame(() => map.invalidateSize());

    return () => {
      window.cancelAnimationFrame(frame);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) {
      return;
    }
    const map = mapRef.current;
    const previous = markerRef.current.getLatLng();
    markerRef.current.setLatLng([lat, lon]);
    const jumped = shouldResetCityZoom(previous.lat, previous.lng, lat, lon);
    map.setView([lat, lon], nextMapZoom({ jumped, currentZoom: map.getZoom() }));
    map.invalidateSize();
  }, [lat, lon]);

  return <div ref={nodeRef} className="place-map" aria-label="Map showing selected location" aria-describedby="place-map-help" />;
}
