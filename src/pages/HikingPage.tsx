import GpsTrackingMap from "@/features/gps/components/GpsTrackingMap";
import { useHiking } from "@/features/hiking/hooks/useHiking";

export default function HikingPage() {
  const {
    geoJson,
    currentPos,
    trail,
    isTracking,
    isLoading,
    error,
    start,
    stop
  } = useHiking();

  return (
    <div style={{ width: "100vw", height: "100dvh", position: "relative" }}>
      <GpsTrackingMap
        geoJson={geoJson}
        currentPos={currentPos}
        trail={trail}
        isTracking={isTracking}
        isLoading={isLoading}
        error={error}
        onStart={start}
        onStop={stop}
      />
    </div>
  );
}
