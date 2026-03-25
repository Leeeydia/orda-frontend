import GpsTrackingMap from "@/features/gps/components/GpsTrackingMap";
import { useHiking } from "@/features/hiking/hooks/useHiking";

export default function HikingPage() {
  const {
    geoJson,
    currentPos,
    isTracking,
    isLoading,
    error,
    savedPointCount,
    start,
    stop
  } = useHiking();

  return (
    <div style={{ width: "100vw", height: "100dvh", position: "relative" }}>
      <GpsTrackingMap
        geoJson={geoJson}
        currentPos={currentPos}
        isTracking={isTracking}
        isLoading={isLoading}
        error={error}
        savedPointCount={savedPointCount}
        onStart={start}
        onStop={stop}
      />
    </div>
  );
}
