import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { FeatureCollection, LineString, Point } from "geojson";
import CommonMap from "@/components/map/CommonMap";
import type { ReplaySessionModel } from "../types/hiking.types";

type ReplayCurrentPosition = {
  lat: number;
  lng: number;
};

export type ReplayCameraMode =
  | "intro-overview"
  | "focus-start"
  | "follow"
  | "outro-overview";

type ReplayMapSectionProps = {
  replay: ReplaySessionModel | null;
  currentPosition?: ReplayCurrentPosition | null;
  currentIndex?: number;
  cameraMode: ReplayCameraMode;
};

const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: []
};

function createReplayMarkerElement() {
  const wrapper = document.createElement("div");
  wrapper.style.width = "24px";
  wrapper.style.height = "24px";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";
  wrapper.style.pointerEvents = "none";

  const outerRing = document.createElement("div");
  outerRing.style.width = "24px";
  outerRing.style.height = "24px";
  outerRing.style.borderRadius = "9999px";
  outerRing.style.background = "rgba(163, 190, 76, 0.22)";
  outerRing.style.border = "2px solid rgba(163, 190, 76, 0.45)";
  outerRing.style.display = "flex";
  outerRing.style.alignItems = "center";
  outerRing.style.justifyContent = "center";
  outerRing.style.boxShadow = "0 4px 14px rgba(47, 52, 21, 0.28)";

  const innerDot = document.createElement("div");
  innerDot.style.width = "12px";
  innerDot.style.height = "12px";
  innerDot.style.borderRadius = "9999px";
  innerDot.style.background = "#2F3415";
  innerDot.style.border = "3px solid #ffffff";
  innerDot.style.boxSizing = "border-box";

  outerRing.appendChild(innerDot);
  wrapper.appendChild(outerRing);

  return wrapper;
}

function getPassedLineCoordinates(
  replay: ReplaySessionModel | null,
  currentIndex: number,
  currentPosition?: ReplayCurrentPosition | null
): [number, number][] {
  if (!replay || replay.lineCoordinates.length === 0) {
    return [];
  }

  if (currentIndex < 0) {
    return [];
  }

  const safeIndex = Math.min(currentIndex, replay.lineCoordinates.length - 1);
  const passedCoordinates = replay.lineCoordinates.slice(0, safeIndex + 1);

  if (currentPosition) {
    const lastCoordinate = passedCoordinates[passedCoordinates.length - 1];
    const currentCoordinate: [number, number] = [
      currentPosition.lng,
      currentPosition.lat
    ];

    if (
      !lastCoordinate ||
      lastCoordinate[0] !== currentCoordinate[0] ||
      lastCoordinate[1] !== currentCoordinate[1]
    ) {
      passedCoordinates.push(currentCoordinate);
    }
  }

  return passedCoordinates;
}

function getReplayDisplayGeoJson(
  replay: ReplaySessionModel | null,
  currentIndex: number,
  currentPosition?: ReplayCurrentPosition | null
): FeatureCollection {
  if (!replay || replay.lineCoordinates.length === 0) {
    return EMPTY_FEATURE_COLLECTION;
  }

  const passedCoordinates = getPassedLineCoordinates(
    replay,
    currentIndex,
    currentPosition
  );

  const features: FeatureCollection["features"] = [];

  if (passedCoordinates.length >= 2) {
    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: passedCoordinates
      } satisfies LineString,
      properties: {
        type: "track-line"
      }
    });
  }

  if (passedCoordinates.length >= 1) {
    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: passedCoordinates[0]
      } satisfies Point,
      properties: {
        type: "start-point"
      }
    });
  }

  return {
    type: "FeatureCollection",
    features
  };
}

function fitReplayBounds(map: maplibregl.Map, replay: ReplaySessionModel) {
  const coords = replay.lineCoordinates;
  if (coords.length === 0) return;

  if (coords.length === 1) {
    map.easeTo({
      center: coords[0],
      zoom: 15,
      duration: 900
    });
    return;
  }

  const bounds = coords.reduce(
    (acc, coord) => acc.extend(coord),
    new maplibregl.LngLatBounds(coords[0], coords[0])
  );

  map.fitBounds(bounds, {
    padding: {
      top: 88,
      right: 24,
      bottom: 112,
      left: 24
    },
    duration: 900
  });
}

function focusStartPoint(map: maplibregl.Map, replay: ReplaySessionModel) {
  const startCoordinate = replay.lineCoordinates[0];
  if (!startCoordinate) return;

  map.easeTo({
    center: startCoordinate,
    zoom: 16,
    duration: 850,
    essential: true
  });
}

export default function ReplayMapSection({
  replay,
  currentPosition,
  currentIndex = -1,
  cameraMode
}: ReplayMapSectionProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const appliedCameraModeRef = useRef<ReplayCameraMode | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const displayGeoJson = useMemo(() => {
    return getReplayDisplayGeoJson(replay, currentIndex, currentPosition);
  }, [replay, currentIndex, currentPosition]);

  useEffect(() => {
    appliedCameraModeRef.current = null;
  }, [replay?.sessionId]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !replay) return;
    if (appliedCameraModeRef.current === cameraMode) return;

    if (cameraMode === "intro-overview") {
      fitReplayBounds(mapRef.current, replay);
      appliedCameraModeRef.current = cameraMode;
      return;
    }

    if (cameraMode === "focus-start") {
      focusStartPoint(mapRef.current, replay);
      appliedCameraModeRef.current = cameraMode;
      return;
    }

    if (cameraMode === "outro-overview") {
      fitReplayBounds(mapRef.current, replay);
      appliedCameraModeRef.current = cameraMode;
      return;
    }

    if (cameraMode === "follow") {
      appliedCameraModeRef.current = cameraMode;
    }
  }, [isMapReady, replay, cameraMode]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    if (!currentPosition) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    const lngLat: [number, number] = [currentPosition.lng, currentPosition.lat];

    if (!markerRef.current) {
      const el = createReplayMarkerElement();

      markerRef.current = new maplibregl.Marker({
        element: el,
        anchor: "center"
      })
        .setLngLat(lngLat)
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat(lngLat);
    }
  }, [isMapReady, currentPosition]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !currentPosition) return;
    if (cameraMode !== "follow") return;

    mapRef.current.easeTo({
      center: [currentPosition.lng, currentPosition.lat],
      duration: 250,
      essential: true
    });
  }, [isMapReady, currentPosition, cameraMode]);

  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, []);

  if (!replay || replay.lineCoordinates.length === 0) {
    return (
      <div className="absolute inset-0 z-0 flex items-center justify-center px-6 text-center">
        <div className="rounded-3xl bg-white/88 px-5 py-4 shadow-sm backdrop-blur">
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
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(0,0,0,0.10),_rgba(0,0,0,0)_22%,_rgba(0,0,0,0.24)_100%)]" />

      <CommonMap
        geoJsonData={displayGeoJson}
        className="h-full w-full"
        showNavigationControl={false}
        showAttributionControl={false}
        compactAttributionControl={true}
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
