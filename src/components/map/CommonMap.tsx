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
  styleUrl = "https://tiles.openfreemap.org/styles/bright",
  className,
  geoJsonData = null,
  onMapReady
}: CommonMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const isLoadedRef = useRef(false);
  const onMapReadyRef = useRef(onMapReady);

  // onMapReady가 인라인 함수여도 map 재생성 안 되게
  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);

  // 지도 초기화 — 마운트 1회만
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center,
      zoom
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      // 소스/레이어를 빈 데이터로 먼저 등록
      map.addSource(GEOJSON_SOURCE_ID, {
        type: "geojson",
        data: geoJsonData ?? { type: "FeatureCollection", features: [] }
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

  // geoJsonData 변경 시 소스만 업데이트 (지도 재생성 X)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoadedRef.current) return;

    const source = map.getSource(GEOJSON_SOURCE_ID) as
      | maplibregl.GeoJSONSource
      | undefined;
    if (!source) return;

    source.setData(geoJsonData ?? { type: "FeatureCollection", features: [] });
  }, [geoJsonData]);

  return (
    <div
      ref={mapContainerRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
