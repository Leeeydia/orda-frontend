import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { FeatureCollection, LineString, Point } from "geojson";
import CommonMap from "@/components/map/CommonMap";
import type { ReplaySessionModel } from "../types/hiking.types";

type ReplayMapSectionProps = {
  replay: ReplaySessionModel | null;
};

const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: []
};

function getReplayDisplayGeoJson(
  replay: ReplaySessionModel | null
): FeatureCollection {
  if (!replay || replay.lineCoordinates.length === 0) {
    return EMPTY_FEATURE_COLLECTION;
  }

  const features: FeatureCollection["features"] = [];

  if (replay.lineCoordinates.length >= 2) {
    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: replay.lineCoordinates
      } satisfies LineString,
      properties: {
        type: "track-line"
      }
    });
  }

  const startPoint = replay.lineCoordinates[0];
  const endPoint = replay.lineCoordinates[replay.lineCoordinates.length - 1];

  features.push({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: startPoint
    } satisfies Point,
    properties: {
      type: "start-point"
    }
  });

  if (replay.lineCoordinates.length > 1) {
    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: endPoint
      } satisfies Point,
      properties: {
        type: "end-point"
      }
    });
  }

  return {
    type: "FeatureCollection",
    features
  };
}

function getReplayBounds(
  replay: ReplaySessionModel | null
): [[number, number], [number, number]] | null {
  if (!replay || replay.lineCoordinates.length === 0) {
    return null;
  }

  const longitudes = replay.lineCoordinates.map((coord) => coord[0]);
  const latitudes = replay.lineCoordinates.map((coord) => coord[1]);

  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);

  return [
    [minLng, minLat],
    [maxLng, maxLat]
  ];
}

export default function ReplayMapSection({
  replay
}: ReplayMapSectionProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const displayGeoJson = useMemo(() => {
    return getReplayDisplayGeoJson(replay);
  }, [replay]);

  const bounds = useMemo(() => {
    return getReplayBounds(replay);
  }, [replay]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !bounds) return;

    mapRef.current.resize();
    mapRef.current.fitBounds(bounds, {
      padding: {
        top: 110,
        right: 24,
        bottom: 170,
        left: 24
      },
      duration: 800
    });
  }, [isMapReady, bounds]);

  if (!replay || replay.lineCoordinates.length === 0) {
    return (
      <div className="absolute inset-0 z-0 flex items-center justify-center px-6 text-center">
        <div className="rounded-3xl border border-white/40 bg-white/88 px-5 py-4 shadow-sm backdrop-blur">
          <p className="text-base font-semibold text-[#4a521e]">
            표시할 리플레이 경로가 없습니다
          </p>
          <p className="mt-2 text-sm text-slate-600">
            저장된 리플레이 포인트가 있으면 이 영역에 경로가 표시됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(137,148,61,0.14),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(255,255,255,0.12),_rgba(255,255,255,0)_28%,_rgba(0,0,0,0.08)_100%)]" />

      <CommonMap
        geoJsonData={displayGeoJson}
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