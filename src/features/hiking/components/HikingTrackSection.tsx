import { useEffect, useMemo, useRef, useState } from "react";
import type maplibregl from "maplibre-gl";
import CommonMap from "@/components/map/CommonMap";
import {
  getTrackBounds,
  mapTrackFeaturesToDisplayGeoJson
} from "../mappers/hikingMappers";
import type { HikingTrackFeatureCollection, SummitMarkerItem } from "../types/hiking.types";

type HikingTrackSectionProps = {
  tracks: HikingTrackFeatureCollection | null;
  verifiedSummits?: SummitMarkerItem[];
};

export default function HikingTrackSection({
  tracks, verifiedSummits = []
}: HikingTrackSectionProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const displayGeoJson = useMemo(() => {
    return mapTrackFeaturesToDisplayGeoJson(tracks);
  }, [tracks]);

  const bounds = useMemo(() => {
    return getTrackBounds(tracks);
  }, [tracks]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !bounds) return;

    mapRef.current.resize();
    mapRef.current.fitBounds(bounds, {
      padding: {
        top: 96,
        right: 24,
        bottom: 260,
        left: 24
      },
      duration: 800
    });
  }, [isMapReady, bounds, displayGeoJson]);

  if (!tracks || tracks.features.length === 0) {
    return (
      <div className="absolute inset-0 z-0 flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-base font-semibold text-[#4a521e]">
            표시할 트랙이 없습니다
          </p>
          <p className="mt-2 text-sm text-slate-600">
            저장된 GPS 트랙이 있으면 이 영역에 경로가 표시됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      <CommonMap
        geoJsonData={displayGeoJson}
        summitMarkers={verifiedSummits}
        className="h-full w-full"
        showNavigationControl={false}
        lineColor="#89943d"
        lineWidth={5}
        pointColor="#4a521e"
        pointStrokeColor="#ffffff"
        pointRadius={6}
        startPointColor="#A3BE4C"
        endPointColor="#2F3415"
        startPointRadius={8}
        endPointRadius={8}
        onMapReady={(map) => {
          mapRef.current = map;
          setIsMapReady(true);

          setTimeout(() => {
            map.resize();
          }, 0);
        }}
      />
    </div>
  );
}