/**
 * 📄 src/features/gps/components/GpsTrackingMap.tsx
 *
 * 변경 사항:
 *  - 사용하지 않는 props 제거 (isTracking, isLoading, error, savedPointCount, onStart, onStop)
 *  - [orda/feat/trail-difficulty] 난이도 레이어 추가, onTrailLoaded prop 추가, 나침반 버튼 위치 조정
 *  - [orda/feat/trail-difficulty] onMapReady prop 추가 (내 위치로 돌아오기 버튼용 map 인스턴스 전달)
 *  - [orda/feat/trail-bbox-filter] 지도 이동/줌 시 bbox 기반 API 재호출로 변경
 *  - [orda/feat/trail-bbox-filter] bbox 1.5배 여유분 적용
 *  - [orda/feat/trail-bbox-filter] 줌 레벨 8 미만 시 등산로 레이어 숨김 + 안내 메시지 표시
 *  - [orda/feat/trail-difficulty] currentPos 마커 추가
 *  - [orda/feat/trail-difficulty] isTracking 시 배낭맨+마커 합성 엘리먼트로 교체
 *  - [orda/feat/trail-difficulty] 줌 레벨 기반 배낭맨 크기 동적 조정
 */

import { useState, useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import { getTrailDifficultyMapByBbox } from "@/features/trail/api/trailApi";
import type { TrailGeoJson } from "@/features/trail/types/trail.types";

import CommonMap from "@/components/map/CommonMap";
import type { FeatureCollection } from "geojson";
import type { GpsPoint } from "../types/gps.types";

const DIFFICULTY_COLOR_MAP: Record<string, string> = {
  easy: "#22c55e",
  moderate: "#84cc16",
  hard: "#eab308",
  very_hard: "#f97316",
  extreme: "#ef4444"
};
const TRAIL_SOURCE_ID = "trail-difficulty-source";
const TRAIL_LAYER_ID = "trail-difficulty-layer";
const MIN_ZOOM_FOR_TRAIL = 8;

// [orda/feat/trail-difficulty] idle 상태 원형 마커
function createCurrentPosMarkerElement() {
  const wrapper = document.createElement("div");
  wrapper.style.width = "24px";
  wrapper.style.height = "24px";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";
  wrapper.style.pointerEvents = "none";

  const outerRing = document.createElement("div");
  outerRing.style.width = "24px";
  outerRing.style.height = "24px";
  outerRing.style.borderRadius = "9999px";
  outerRing.style.background = "rgba(59, 130, 246, 0.22)";
  outerRing.style.border = "2px solid rgba(59, 130, 246, 0.45)";
  outerRing.style.display = "flex";
  outerRing.style.alignItems = "center";
  outerRing.style.justifyContent = "center";
  outerRing.style.boxShadow = "0 4px 14px rgba(47, 52, 21, 0.28)";

  const innerDot = document.createElement("div");
  innerDot.style.width = "12px";
  innerDot.style.height = "12px";
  innerDot.style.borderRadius = "9999px";
  innerDot.style.background = "#1d4ed8";
  innerDot.style.border = "3px solid #FFFFFF";
  innerDot.style.boxSizing = "border-box";

  outerRing.appendChild(innerDot);
  wrapper.appendChild(outerRing);
  return wrapper;
}

// [orda/feat/trail-difficulty] 줌 레벨 기반 배낭맨 크기 계산
function getHikerSize(zoom: number): number {
  if (zoom < 10) return 24;
  if (zoom < 12) return 32;
  if (zoom < 14) return 40;
  return 48;
}

// [orda/feat/trail-difficulty] 등산 중 배낭맨+마커 합성 엘리먼트
function createHikingMarkerElement(hikerIconUrl: string, size: number = 48) {
  const wrapper = document.createElement("div");
  wrapper.style.width = `${size}px`;
  wrapper.style.height = `${size}px`;
  wrapper.style.position = "relative";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";
  wrapper.style.pointerEvents = "none";

  const img = document.createElement("img");
  img.src = hikerIconUrl;
  img.style.width = `${size}px`;
  img.style.height = `${size}px`;
  img.style.position = "absolute";

  const dotSize = Math.max(12, Math.round(size * 0.43));
  const innerSize = Math.max(6, Math.round(dotSize * 0.5));

  const outerRing = document.createElement("div");
  outerRing.style.width = `${dotSize}px`;
  outerRing.style.height = `${dotSize}px`;
  outerRing.style.borderRadius = "9999px";
  outerRing.style.background = "rgba(59, 130, 246, 0.22)";
  outerRing.style.border = "2px solid rgba(59, 130, 246, 0.45)";
  outerRing.style.display = "flex";
  outerRing.style.alignItems = "center";
  outerRing.style.justifyContent = "center";
  outerRing.style.boxShadow = "0 4px 14px rgba(47, 52, 21, 0.28)";
  outerRing.style.position = "absolute";
  outerRing.style.zIndex = "1";

  const innerDot = document.createElement("div");
  innerDot.style.width = `${innerSize}px`;
  innerDot.style.height = `${innerSize}px`;
  innerDot.style.borderRadius = "9999px";
  innerDot.style.background = "#1d4ed8";
  innerDot.style.border = "3px solid #FFFFFF";
  innerDot.style.boxSizing = "border-box";

  outerRing.appendChild(innerDot);
  wrapper.appendChild(outerRing);
  wrapper.appendChild(img);
  return wrapper;
}

interface Props {
  geoJson: FeatureCollection;
  currentPos: GpsPoint | null;
  isTracking?: boolean;
  hikerIconUrl?: string;
  onTrailLoaded?: () => void;
  onMapReady?: (map: maplibregl.Map) => void;
}

const GpsTrackingMap = ({
  geoJson,
  currentPos,
  isTracking = false,
  hikerIconUrl,
  onTrailLoaded,
  onMapReady
}: Props) => {
  const [isTooFar, setIsTooFar] = useState(false);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const isTrackingRef = useRef(isTracking);
  const hikerIconUrlRef = useRef(hikerIconUrl);

  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  useEffect(() => {
    hikerIconUrlRef.current = hikerIconUrl;
  }, [hikerIconUrl]);

  // [orda/feat/trail-difficulty] currentPos 변경 시 마커 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !currentPos) return;

    const zoom = mapInstanceRef.current.getZoom();
    const size = getHikerSize(zoom);
    const el =
      isTracking && hikerIconUrl
        ? createHikingMarkerElement(hikerIconUrl, size)
        : createCurrentPosMarkerElement();

    if (markerRef.current) {
      markerRef.current.remove();
    }
    markerRef.current = new maplibregl.Marker({
      element: el,
      anchor: "center"
    })
      .setLngLat([currentPos.lng, currentPos.lat])
      .addTo(mapInstanceRef.current);
  }, [currentPos, isTracking, hikerIconUrl]);

  const handleMapReady = (map: maplibregl.Map) => {
    mapInstanceRef.current = map;

    const loadTrailByBbox = async () => {
      if (map.getZoom() < MIN_ZOOM_FOR_TRAIL) {
        if (map.getLayer(TRAIL_LAYER_ID)) {
          map.setLayoutProperty(TRAIL_LAYER_ID, "visibility", "none");
        }
        setIsTooFar(true);
        return;
      }

      setIsTooFar(false);
      if (map.getLayer(TRAIL_LAYER_ID)) {
        map.setLayoutProperty(TRAIL_LAYER_ID, "visibility", "visible");
      }

      const bounds = map.getBounds();
      const lngPad = (bounds.getEast() - bounds.getWest()) * 0.25;
      const latPad = (bounds.getNorth() - bounds.getSouth()) * 0.25;
      const minLng = bounds.getWest() - lngPad;
      const minLat = bounds.getSouth() - latPad;
      const maxLng = bounds.getEast() + lngPad;
      const maxLat = bounds.getNorth() + latPad;

      try {
        const data: TrailGeoJson = await getTrailDifficultyMapByBbox(
          minLng,
          minLat,
          maxLng,
          maxLat
        );

        const source = map.getSource(TRAIL_SOURCE_ID) as
          | maplibregl.GeoJSONSource
          | undefined;
        if (source) {
          source.setData(data);
        } else {
          map.addSource(TRAIL_SOURCE_ID, { type: "geojson", data });
          map.addLayer({
            id: TRAIL_LAYER_ID,
            type: "line",
            source: TRAIL_SOURCE_ID,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": [
                "match",
                ["get", "difficulty"],
                "easy",
                DIFFICULTY_COLOR_MAP.easy,
                "moderate",
                DIFFICULTY_COLOR_MAP.moderate,
                "hard",
                DIFFICULTY_COLOR_MAP.hard,
                "very_hard",
                DIFFICULTY_COLOR_MAP.very_hard,
                "extreme",
                DIFFICULTY_COLOR_MAP.extreme,
                "#cccccc"
              ],
              "line-width": 3,
              "line-opacity": 0.85
            }
          });
          onTrailLoaded?.();
        }
      } catch (e) {
        console.error("trail bbox load error", e);
      }
    };

    loadTrailByBbox();
    map.on("moveend", loadTrailByBbox);

    // [orda/feat/trail-difficulty] 줌 시 배낭맨 크기 동적 조정
    map.on("zoom", () => {
      if (
        !isTrackingRef.current ||
        !hikerIconUrlRef.current ||
        !markerRef.current
      )
        return;
      const zoom = map.getZoom();
      const size = getHikerSize(zoom);
      const el = createHikingMarkerElement(hikerIconUrlRef.current, size);
      const lngLat = markerRef.current.getLngLat();
      markerRef.current.remove();
      markerRef.current = new maplibregl.Marker({
        element: el,
        anchor: "center"
      })
        .setLngLat(lngLat)
        .addTo(map);
    });

    onMapReady?.(map);
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <style>{`.maplibregl-ctrl-top-right { top: 60px !important; }`}</style>
      <CommonMap
        geoJsonData={geoJson}
        center={currentPos ? [currentPos.lng, currentPos.lat] : undefined}
        className="h-full w-full"
        onMapReady={handleMapReady}
      />
      {isTooFar && (
        <div
          style={{
            position: "absolute",
            top: "70px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0,0,0,0.6)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "13px",
            whiteSpace: "nowrap",
            pointerEvents: "none"
          }}>
          등산로를 보려면 지도를 확대하세요
        </div>
      )}
    </div>
  );
};

export default GpsTrackingMap;
