import CommonMap from "@/components/map/CommonMap";
import type { FeatureCollection } from "geojson";
import type { GpsPoint } from "../types/gps.types";

interface Props {
  geoJson: FeatureCollection;
  currentPos: GpsPoint | null;
  isTracking: boolean;
  isLoading: boolean;
  error: string | null;
  savedPointCount: number;
  onStart: () => void;
  onStop: () => void;
}

export default function GpsTrackingMap({
  geoJson,
  currentPos,
  isTracking,
  isLoading,
  error,
  savedPointCount,
  onStart,
  onStop
}: Props) {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <CommonMap
          geoJsonData={geoJson}
          center={currentPos ? [currentPos.lng, currentPos.lat] : undefined}
          className="h-full w-full"
        />
      </div>

      {/* GPS 정보 패널 */}
      {currentPos && (
        <div className="absolute top-4 left-4 z-10 space-y-1 rounded-xl bg-white/90 px-4 py-3 text-sm shadow-md">
          <p className="font-medium text-gray-700">📍 GPS 정보</p>
          <p className="text-gray-600">위도: {currentPos.lat.toFixed(6)}</p>
          <p className="text-gray-600">경도: {currentPos.lng.toFixed(6)}</p>
          <p className="text-gray-600">
            정확도: {currentPos.accuracy.toFixed(1)}m
          </p>
          <p className="text-gray-600">
            고도:{" "}
            {currentPos.altitude != null
              ? currentPos.altitude.toFixed(1) + "m"
              : "미지원"}
          </p>
          <p className="text-gray-600">누적 포인트: {savedPointCount}개</p>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="absolute bottom-20 left-4 z-10 rounded-lg bg-red-500 px-3 py-2 text-sm text-white">
          {error}
        </div>
      )}

      {/* 시작/종료 버튼 */}
      <button
        onClick={isTracking ? onStop : onStart}
        disabled={isLoading}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-full px-6 py-3 font-medium text-white disabled:opacity-50"
        style={{ background: isTracking ? "#dc2626" : "#2563eb" }}>
        {isLoading ? "처리 중..." : isTracking ? "⏹ 등산 종료" : "▶ 등산 시작"}
      </button>
    </div>
  );
}
