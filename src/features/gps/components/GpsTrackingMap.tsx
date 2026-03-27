/**
 * 📄 src/features/gps/components/GpsTrackingMap.tsx
 *
 * 변경 사항:
 *  - 버튼, GPS 정보 패널 완전 제거
 *  - 지도 렌더링만 담당
 *  - UI는 각 페이지에서 직접 구현
 */

import CommonMap from "@/components/map/CommonMap";
import type { FeatureCollection } from "geojson";
import type { GpsPoint } from "../types/gps.types";

interface Props {
  geoJson: FeatureCollection;
  currentPos: GpsPoint | null;
}

export default function GpsTrackingMap({ geoJson, currentPos }: Props) {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <CommonMap
        geoJsonData={geoJson}
        center={currentPos ? [currentPos.lng, currentPos.lat] : undefined}
        className="h-full w-full"
      />
    </div>
  );
}