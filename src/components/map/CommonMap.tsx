import { useCallback, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import type { SummitMarkerItem } from "@/features/hiking/types/hiking.types";
import "maplibre-gl/dist/maplibre-gl.css";

type CommonMapProps = {
  center?: [number, number];
  zoom?: number;
  styleUrl?: string;
  className?: string;
  geoJsonData?: FeatureCollection | null;
  onMapReady?: (map: maplibregl.Map) => void;
  showNavigationControl?: boolean;
  lineColor?: string;
  lineWidth?: number;
  pointColor?: string;
  pointStrokeColor?: string;
  pointRadius?: number;
  startPointColor?: string;
  endPointColor?: string;
  startPointRadius?: number;
  endPointRadius?: number;
  summitMarkers?: SummitMarkerItem[];
};

const GEOJSON_SOURCE_ID = "geojson-source";
const GEOJSON_LINE_LAYER_ID = "geojson-line-layer";
const GEOJSON_POINT_LAYER_ID = "geojson-point-layer";
const GEOJSON_START_POINT_LAYER_ID = "geojson-start-point-layer";
const GEOJSON_END_POINT_LAYER_ID = "geojson-end-point-layer";

function createSummitMarkerElement() {
  const el = document.createElement("div");
  el.style.width = "24px";
  el.style.height = "24px";
  el.style.cursor = "pointer";

  el.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3L21 19H3L12 3Z"
        fill="#F97316"
        stroke="white"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <circle cx="12" cy="15" r="1.5" fill="white" />
    </svg>
  `;
  return el;
}

export default function CommonMap({
  center = [127.3845, 36.3504],
  zoom = 12,
  styleUrl = "https://tiles.openfreemap.org/styles/bright",
  className,
  geoJsonData = null,
  onMapReady,
  showNavigationControl = true,
  lineColor = "#2563eb",
  lineWidth = 4,
  pointColor = "#dc2626",
  pointStrokeColor = "#ffffff",
  pointRadius = 6,
  startPointColor = "#A3BE4C",
  endPointColor = "#2F3415",
  startPointRadius = 8,
  endPointRadius = 8,
  summitMarkers = []
}: CommonMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const isLoadedRef = useRef(false);
  const onMapReadyRef = useRef(onMapReady);
  const summitMarkerRefs = useRef<maplibregl.Marker[]>([]);

  useEffect(() => { onMapReadyRef.current = onMapReady; }, [onMapReady]);

  const clearSummitMarkers = useCallback(() => {
    summitMarkerRefs.current.forEach((marker) => marker.remove());
    summitMarkerRefs.current = [];
  }, []);

  const renderSummitMarkers = useCallback((map: maplibregl.Map, markers: SummitMarkerItem[]) => {
    clearSummitMarkers();
    markers.forEach((summit) => {
      if (typeof summit.longitude !== 'number' || typeof summit.latitude !== 'number') return;

      const el = createSummitMarkerElement();
      const popup = new maplibregl.Popup({ offset: 14 }).setHTML(
        `<div style="font-size:12px; font-weight:600;">${summit.summitName}</div>`
      );

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([summit.longitude, summit.latitude])
        .setPopup(popup)
        .addTo(map);

      summitMarkerRefs.current.push(marker);
    });
  }, [clearSummitMarkers]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center,
      zoom
    });

    if (showNavigationControl) {
      map.addControl(new maplibregl.NavigationControl(), "top-right");
    }

    map.on("load", () => {
      map.addSource(GEOJSON_SOURCE_ID, {
        type: "geojson",
        data: geoJsonData ?? { type: "FeatureCollection", features: [] }
      });

      // 레이어 추가 (Line, Point, Start, End)
      const layers = [
        { id: GEOJSON_LINE_LAYER_ID, type: "line", filter: ["==", ["geometry-type"], "LineString"], paint: { "line-color": lineColor, "line-width": lineWidth } },
        { id: GEOJSON_POINT_LAYER_ID, type: "circle", filter: ["all", ["==", ["geometry-type"], "Point"], ["!", ["in", ["get", "type"], ["literal", ["start-point", "end-point"]]]]], paint: { "circle-radius": pointRadius, "circle-color": pointColor, "circle-stroke-width": 2, "circle-stroke-color": pointStrokeColor } },
        { id: GEOJSON_START_POINT_LAYER_ID, type: "circle", filter: ["all", ["==", ["geometry-type"], "Point"], ["==", ["get", "type"], "start-point"]], paint: { "circle-radius": startPointRadius, "circle-color": startPointColor, "circle-stroke-width": 2, "circle-stroke-color": pointStrokeColor } },
        { id: GEOJSON_END_POINT_LAYER_ID, type: "circle", filter: ["all", ["==", ["geometry-type"], "Point"], ["==", ["get", "type"], "end-point"]], paint: { "circle-radius": endPointRadius, "circle-color": endPointColor, "circle-stroke-width": 2, "circle-stroke-color": pointStrokeColor } }
      ];

      layers.forEach(layer => map.addLayer({ ...layer, source: GEOJSON_SOURCE_ID } as maplibregl.AddLayerObject));

      isLoadedRef.current = true;
      renderSummitMarkers(map, summitMarkers);
      onMapReadyRef.current?.(map);
    });

    mapRef.current = map;
    return () => {
      clearSummitMarkers();
      map.remove();
      mapRef.current = null;
      isLoadedRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current;
    if (map && isLoadedRef.current) {
      const source = map.getSource(GEOJSON_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
      if (source) source.setData(geoJsonData ?? { type: "FeatureCollection", features: [] });
    }
  }, [geoJsonData]);

  useEffect(() => {
    if (mapRef.current && isLoadedRef.current) {
      renderSummitMarkers(mapRef.current, summitMarkers);
    }
  }, [summitMarkers, renderSummitMarkers]);

  return (
    <div ref={mapContainerRef} className={className} style={{ width: "100%", height: "100%" }} />
  );
}