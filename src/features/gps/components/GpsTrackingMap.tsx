/**
 * 📄 src/features/gps/components/GpsTrackingMap.tsx
 *
 * 변경 사항:
 *  - 사용하지 않는 props 제거 (isTracking, isLoading, error, savedPointCount, onStart, onStop)
 */

// [orda/feat/trail-difficulty] 추가 import
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { getTrailDifficultyMap } from "@/features/trail/api/trailApi";
import type { TrailGeoJson } from "@/features/trail/types/trail.types";
// [orda/feat/trail-difficulty] 추가 import 끝

import CommonMap from "@/components/map/CommonMap";
import type { FeatureCollection } from "geojson";
import type { GpsPoint } from "../types/gps.types";

// [orda/feat/trail-difficulty] 난이도별 색상 (팀 확정 기준)
const DIFFICULTY_COLOR_MAP: Record<string, string> = {
  easy: "#22c55e",
  moderate: "#84cc16",
  hard: "#eab308",
  very_hard: "#f97316",
  extreme: "#ef4444"
};
const TRAIL_SOURCE_ID = "trail-difficulty-source";
const TRAIL_LAYER_ID = "trail-difficulty-layer";
// [orda/feat/trail-difficulty] 상수 끝

interface Props {
  geoJson: FeatureCollection;
  currentPos: GpsPoint | null;
  onTrailLoaded?: () => void; // [orda/feat/trail-difficulty] 난이도 레이어 로딩 완료 콜백 추가
}

const GpsTrackingMap = ({ geoJson, currentPos, onTrailLoaded }: Props) => {
  // [orda/feat/trail-difficulty] 난이도 데이터 캐시 및 선제 로딩
  const trailGeoJsonRef = useRef<TrailGeoJson | null>(null);
  useEffect(() => {
    getTrailDifficultyMap().then((data) => {
      trailGeoJsonRef.current = data;
    });
  }, []);

  const handleMapReady = (map: maplibregl.Map) => {
    const addTrailLayer = (data: TrailGeoJson) => {
      if (map.getSource(TRAIL_SOURCE_ID)) return;
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
      onTrailLoaded?.(); // [orda/feat/trail-difficulty] 레이어 추가 완료 시 콜백 호출
    };

    if (trailGeoJsonRef.current) {
      addTrailLayer(trailGeoJsonRef.current);
    } else {
      getTrailDifficultyMap().then((data) => {
        trailGeoJsonRef.current = data;
        addTrailLayer(data);
      });
    }
  };
  // [orda/feat/trail-difficulty] 끝

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* [orda/feat/trail-difficulty] 나침반 버튼 헤더 아래로 위치 조정 */}
      <style>{`.maplibregl-ctrl-top-right { top: 60px !important; }`}</style>
      <CommonMap
        geoJsonData={geoJson}
        center={currentPos ? [currentPos.lng, currentPos.lat] : undefined}
        className="h-full w-full"
        onMapReady={handleMapReady} // [orda/feat/trail-difficulty] 난이도 레이어 콜백 추가
      />
    </div>
  );
};

export default GpsTrackingMap;
