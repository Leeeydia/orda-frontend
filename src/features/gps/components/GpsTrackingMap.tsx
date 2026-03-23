import CommonMap from "@/components/map/CommonMap";
import { useGPS } from "../hooks/useGPS";

export default function GpsTrackingMap() {
  const { geoJson, currentPos, isTracking, error, start, stop, trail } =
    useGPS();

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <CommonMap
        geoJsonData={geoJson}
        center={currentPos ? [currentPos.lng, currentPos.lat] : undefined}
        className="h-full w-full"
      />

      {/* GPS 정보 패널 */}
      {currentPos && (
        <div className="absolute top-4 left-4 space-y-1 rounded-xl bg-white/90 px-4 py-3 text-sm shadow-md">
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
          <p className="text-gray-600">누적 포인트: {trail.length}개</p>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="absolute bottom-20 left-4 rounded-lg bg-red-500 px-3 py-2 text-sm text-white">
          {error}
        </div>
      )}

      {/* 시작/종료 버튼 */}
      <button
        onClick={isTracking ? stop : start}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full px-6 py-3 font-medium text-white"
        style={{ background: isTracking ? "#dc2626" : "#2563eb" }}>
        {isTracking ? "⏹ 등산 종료" : "▶ 등산 시작"}
      </button>
    </div>
  );
}
