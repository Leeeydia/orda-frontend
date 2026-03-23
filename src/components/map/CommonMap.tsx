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
};

const GEOJSON_SOURCE_ID = "geojson-source";
const GEOJSON_LINE_LAYER_ID = "geojson-line-layer";
const GEOJSON_POINT_LAYER_ID = "geojson-point-layer";

export default function CommonMap({
  center = [127.3845, 36.3504],
  zoom = 12,
  styleUrl = "https://demotiles.maplibre.org/style.json",
  className,
  geoJsonData = null,
  onMapReady
}: CommonMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center,
      zoom
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      if (geoJsonData) {
        map.addSource(GEOJSON_SOURCE_ID, {
          type: "geojson",
          data: geoJsonData
        });

        map.addLayer({
          id: GEOJSON_LINE_LAYER_ID,
          type: "line",
          source: GEOJSON_SOURCE_ID,
          filter: ["==", ["geometry-type"], "LineString"],
          paint: {
            "line-color": "#2563eb",
            "line-width": 4
          }
        });

        map.addLayer({
          id: GEOJSON_POINT_LAYER_ID,
          type: "circle",
          source: GEOJSON_SOURCE_ID,
          filter: ["==", ["geometry-type"], "Point"],
          paint: {
            "circle-radius": 6,
            "circle-color": "#dc2626",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff"
          }
        });
      }

      onMapReady?.(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center, zoom, styleUrl, geoJsonData, onMapReady]);

  return (
    <div
      ref={mapContainerRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
