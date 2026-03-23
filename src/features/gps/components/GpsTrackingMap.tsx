import CommonMap from "@/components/map/CommonMap";
import { useGPS } from "../hooks/useGPS";

export default function GpsTrackingMap() {
  const { geoJson, currentPos, isTracking, error, start, stop } = useGPS();

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <CommonMap
        geoJsonData={geoJson}
        center={currentPos ? [currentPos.lng, currentPos.lat] : undefined}
        className="h-full w-full"
      />

      {error && (
        <div className="absolute bottom-20 left-4 rounded-lg bg-red-500 px-3 py-2 text-sm text-white">
          {error}
        </div>
      )}

      <button
        onClick={isTracking ? stop : start}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full px-6 py-3 font-medium text-white"
        style={{ background: isTracking ? "#dc2626" : "#2563eb" }}>
        {isTracking ? "⏹ 등산 종료" : "▶ 등산 시작"}
      </button>
    </div>
  );
}
