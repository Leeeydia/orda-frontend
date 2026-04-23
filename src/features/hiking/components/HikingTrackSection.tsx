import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import CommonMap from "@/components/map/CommonMap";
import {
  clearSummitMarkers,
  renderSummitMarkers
} from "@/components/map/summitMarker";
import {
  getTrackBounds,
  mapTrackFeaturesToDisplayGeoJson
} from "../mappers/hikingMappers";
import type {
  HikingTrackFeatureCollection,
  SummitMarkerItem
} from "../types/hiking.types";

type HikingTrackSectionProps = {
  tracks: HikingTrackFeatureCollection | null;
  verifiedSummits?: SummitMarkerItem[];
};

export default function HikingTrackSection({
  tracks,
  verifiedSummits = []
}: HikingTrackSectionProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const summitMarkerRefs = useRef<Map<string, maplibregl.Marker>>(new Map());
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
        top: 135,
        right: 24,
        bottom: 300,
        left: 24
      },
      duration: 800
    });
  }, [isMapReady, bounds]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    renderSummitMarkers(mapRef.current, verifiedSummits, summitMarkerRefs);
  }, [isMapReady, verifiedSummits]);

  useEffect(() => {
    return () => {
      clearSummitMarkers(summitMarkerRefs);
    };
  }, []);

  if (!tracks || tracks.features.length === 0) {
    return (
      <div className="absolute inset-0 z-0 flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-heading text-base font-semibold">
            표시할 트랙이 없습니다
          </p>
          <p className="text-body/80 mt-2 text-sm">
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
        className="h-full w-full"
        showNavigationControl={false}
        lineColor="#89943D"
        lineWidth={5}
        pointColor="#4A521E"
        pointStrokeColor="#F7F7F6"
        pointRadius={6}
        startPointColor="#A3BE4C"
        endPointColor="#4A521E"
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
