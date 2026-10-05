import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { isValidCoords } from "../weather/locationId.js";
import { CITY_MAP_ZOOM, nextMapZoom, shouldResetCityZoom } from "../weather/mapView.js";

const EMPTY_PLACES = [];

const icon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function PlaceMap({
  lat,
  lon,
  onPinChange,
  savedPlaces = EMPTY_PLACES,
  radarTileUrl = "",
  radarOpacity = 0.7,
  variant = "picker",
  onSavedPlaceClick,
}) {
  const nodeRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const radarLayerRef = useRef(null);
  const savedLayerRef = useRef(null);
  const onPinChangeRef = useRef(onPinChange);
  const onSavedPlaceClickRef = useRef(onSavedPlaceClick);
  onPinChangeRef.current = onPinChange;
  onSavedPlaceClickRef.current = onSavedPlaceClick;

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
      radarLayerRef.current = null;
      savedLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    if (radarLayerRef.current) {
      map.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }
    if (!radarTileUrl) {
      return;
    }
    const layer = L.tileLayer(radarTileUrl, {
      opacity: radarOpacity,
      className: "radar-tiles",
      maxNativeZoom: 7,
      maxZoom: 18,
    });
    layer.addTo(map);
    radarLayerRef.current = layer;
  }, [radarTileUrl]);

  useEffect(() => {
    radarLayerRef.current?.setOpacity(radarOpacity);
  }, [radarOpacity]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    if (savedLayerRef.current) {
      savedLayerRef.current.remove();
      savedLayerRef.current = null;
    }
    const group = L.layerGroup();
    savedPlaces.forEach((place) => {
      if (!isValidCoords(place.lat, place.lon)) {
        return;
      }
      const marker = L.circleMarker([place.lat, place.lon], {
        radius: 7,
        color: "#7ad4c3",
        fillColor: "#7ad4c3",
        fillOpacity: 0.85,
        weight: 2,
      });
      marker.bindTooltip(place.label || "Saved place");
      marker.on("click", (event) => {
        L.DomEvent.stopPropagation(event);
        onSavedPlaceClickRef.current?.(place);
      });
      marker.addTo(group);
    });
    group.addTo(map);
    savedLayerRef.current = group;
  }, [savedPlaces]);

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

  return (
    <div
      ref={nodeRef}
      className={`place-map${variant === "explorer" ? " place-map-explorer" : ""}`}
      aria-label="Map showing selected location"
      aria-describedby="place-map-help"
    />
  );
}
