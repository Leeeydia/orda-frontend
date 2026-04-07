/**
 * 📄 src/features/gps/components/GpsTrackingMap.tsx
 *
 * 변경 사항:
 *  - 사용하지 않는 props 제거 (isTracking, isLoading, error, savedPointCount, onStart, onStop)
 *  - [orda/feat/trail-difficulty] 난이도 레이어 추가, onTrailLoaded prop 추가, 나침반 버튼 위치 조정
 *  - [orda/feat/trail-difficulty] onMapReady prop 추가 (내 위치로 돌아오기 버튼용 map 인스턴스 전달)
 *  - [orda/feat/trail-bbox-filter] 지도 이동/줌 시 bbox 기반 API 재호출로 변경
 *  - [orda/feat/trail-bbox-filter] 디바운스 300ms + bbox 1.5배 여유분 적용
 */

// [orda/feat/trail-difficulty] 추가 import
import maplibregl from "maplibre-gl";
import { getTrailDifficultyMapByBbox } from "@/features/trail/api/trailApi"; // [orda/feat/trail-bbox-filter] bbox 함수로 교체
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
  onTrailLoaded?: () => void; // [orda/feat/trail-difficulty] 난이도 레이어 로딩 완료 콜백
  onMapReady?: (map: maplibregl.Map) => void; // [orda/feat/trail-difficulty] 내 위치로 돌아오기 버튼용 map 인스턴스 전달
}

const GpsTrackingMap = ({
  geoJson,
  currentPos,
  onTrailLoaded,
  onMapReady
}: Props) => {
  const handleMapReady = (map: maplibregl.Map) => {
    // [orda/feat/trail-bbox-filter] bbox 기반으로 난이도 데이터 로드 및 업데이트 (디바운스 + 여유분 적용)
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const loadTrailByBbox = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const bounds = map.getBounds();

        // bbox 1.5배 여유분 적용
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
      }, 300);
    };

    // 최초 로드
    loadTrailByBbox();

    // 지도 이동/줌 종료 시 재호출
    map.on("moveend", loadTrailByBbox);
    // [orda/feat/trail-bbox-filter] 끝

    // [orda/feat/trail-difficulty] map 인스턴스를 부모로 전달 (내 위치로 돌아오기 버튼용)
    onMapReady?.(map);
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* [orda/feat/trail-difficulty] 나침반 버튼 헤더 아래로 위치 조정 */}
      <style>{`.maplibregl-ctrl-top-right { top: 60px !important; }`}</style>
      <CommonMap
        geoJsonData={geoJson}
        center={currentPos ? [currentPos.lng, currentPos.lat] : undefined}
        className="h-full w-full"
        onMapReady={handleMapReady}
      />
    </div>
  );
};

export default GpsTrackingMap;
