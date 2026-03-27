/**
 * 📄 src/features/gps/components/GpsTrackingMap.tsx
 *
 * 변경 사항:
 *  - 사용하지 않는 props 제거 (isTracking, isLoading, error, savedPointCount, onStart, onStop)
 */

import CommonMap from "@/components/map/CommonMap";
import type { FeatureCollection } from "geojson";
import type { GpsPoint } from "../types/gps.types";

interface Props {
  geoJson: FeatureCollection;
  currentPos: GpsPoint | null;
}

const GpsTrackingMap = ({ geoJson, currentPos }: Props) => (
  <div style={{ width: "100%", height: "100%", position: "relative" }}>
    <CommonMap
      geoJsonData={geoJson}
      center={currentPos ? [currentPos.lng, currentPos.lat] : undefined}
      className="h-full w-full"
    />
  </div>
);

export default GpsTrackingMap;
