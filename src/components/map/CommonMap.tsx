import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";

type CommonMapProps = {
  center?: [number, number];
  zoom?: number;
  styleUrl?: string;
  className?: string;
  geoJsonData?: FeatureCollection | null;
  onMapReady?: (map: maplibregl.Map) => void;
  showNavigationControl?: boolean;
  showAttributionControl?: boolean;
  compactAttributionControl?: boolean;
  lineColor?: string;
  lineWidth?: number;
  pointColor?: string;
  pointStrokeColor?: string;
  pointRadius?: number;
  startPointColor?: string;
  endPointColor?: string;
  startPointRadius?: number;
  endPointRadius?: number;
};

const DEFAULT_STYLE_URL =
  import.meta.env.VITE_MAP_STYLE_URL ??
  "https://tiles.openfreemap.org/styles/bright";

const GEOJSON_SOURCE_ID = "geojson-source";
const GEOJSON_LINE_LAYER_ID = "geojson-line-layer";
const GEOJSON_POINT_LAYER_ID = "geojson-point-layer";
const GEOJSON_START_POINT_LAYER_ID = "geojson-start-point-layer";
const GEOJSON_END_POINT_LAYER_ID = "geojson-end-point-layer";

function createEmptyFeatureCollection(): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: []
  };
}

export default function CommonMap({
  center = [127.3845, 36.3504],
  zoom = 12,
  styleUrl = DEFAULT_STYLE_URL,
  className,
  geoJsonData = null,
  onMapReady,
  showNavigationControl = true,
  showAttributionControl = true,
  compactAttributionControl = true,
  lineColor = "#2563eb",
  lineWidth = 4,
  pointColor = "#dc2626",
  pointStrokeColor = "#ffffff",
  pointRadius = 6,
  startPointColor = "#A3BE4C",
  endPointColor = "#2F3415",
  startPointRadius = 8,
  endPointRadius = 8
}: CommonMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const isLoadedRef = useRef(false);
  const onMapReadyRef = useRef(onMapReady);

  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center,
      zoom,
      attributionControl: false
    });

    if (showNavigationControl) {
      map.addControl(new maplibregl.NavigationControl(), "top-right");
    }

    if (showAttributionControl) {
      map.addControl(
        new maplibregl.AttributionControl({
          compact: compactAttributionControl
        }),
        "bottom-right"
      );
    }

    map.on("load", () => {
      map.addSource(GEOJSON_SOURCE_ID, {
        type: "geojson",
        data: geoJsonData ?? createEmptyFeatureCollection()
      });

      map.addLayer({
        id: GEOJSON_LINE_LAYER_ID,
        type: "line",
        source: GEOJSON_SOURCE_ID,
        filter: ["==", ["geometry-type"], "LineString"],
        layout: {
          "line-cap": "round",
          "line-join": "round"
        },
        paint: {
          "line-color": lineColor,
          "line-width": lineWidth
        }
      });

      map.addLayer({
        id: GEOJSON_POINT_LAYER_ID,
        type: "circle",
        source: GEOJSON_SOURCE_ID,
        filter: [
          "all",
          ["==", ["geometry-type"], "Point"],
          [
            "!",
            ["in", ["get", "type"], ["literal", ["start-point", "end-point"]]]
          ]
        ],
        paint: {
          "circle-radius": pointRadius,
          "circle-color": pointColor,
          "circle-stroke-width": 2,
          "circle-stroke-color": pointStrokeColor
        }
      });

      map.addLayer({
        id: GEOJSON_START_POINT_LAYER_ID,
        type: "circle",
        source: GEOJSON_SOURCE_ID,
        filter: [
          "all",
          ["==", ["geometry-type"], "Point"],
          ["==", ["get", "type"], "start-point"]
        ],
        paint: {
          "circle-radius": startPointRadius,
          "circle-color": startPointColor,
          "circle-stroke-width": 2,
          "circle-stroke-color": pointStrokeColor
        }
      });

      map.addLayer({
        id: GEOJSON_END_POINT_LAYER_ID,
        type: "circle",
        source: GEOJSON_SOURCE_ID,
        filter: [
          "all",
          ["==", ["geometry-type"], "Point"],
          ["==", ["get", "type"], "end-point"]
        ],
        paint: {
          "circle-radius": endPointRadius,
          "circle-color": endPointColor,
          "circle-stroke-width": 2,
          "circle-stroke-color": pointStrokeColor
        }
      });

      isLoadedRef.current = true;
      onMapReadyRef.current?.(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      isLoadedRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoadedRef.current) return;

    const source = map.getSource(GEOJSON_SOURCE_ID) as
      | maplibregl.GeoJSONSource
      | undefined;

    if (!source) return;

    source.setData(geoJsonData ?? createEmptyFeatureCollection());
  }, [geoJsonData]);

  return (
    <div
      ref={mapContainerRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
