import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { FeatureCollection, LineString, Point } from "geojson";
import CommonMap from "@/components/map/CommonMap";
import {
  clearSummitMarkers,
  renderSummitMarkers
} from "@/components/map/summitMarker";
import type {
  ReplaySessionModel,
  SummitMarkerItem
} from "../types/hiking.types";

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
  visibleSummits?: SummitMarkerItem[];
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
  innerDot.style.border = "3px solid #FFFFFF";
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

function getReplayBounds(
  replay: ReplaySessionModel | null
): [[number, number], [number, number]] | null {
  if (!replay || replay.lineCoordinates.length === 0) {
    return null;
  }

  const longitudes = replay.lineCoordinates.map((feature) => feature[0]);
  const latitudes = replay.lineCoordinates.map((feature) => feature[1]);

  return [
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)]
  ];
}

export default function ReplayMapSection({
  replay,
  currentPosition,
  currentIndex = -1,
  cameraMode,
  visibleSummits = []
}: ReplayMapSectionProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const replayMarkerRef = useRef<maplibregl.Marker | null>(null);
  const summitMarkerRefs = useRef<maplibregl.Marker[]>([]);
  const previousCameraModeRef = useRef<ReplayCameraMode | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const displayGeoJson = useMemo(() => {
    return getReplayDisplayGeoJson(replay, currentIndex, currentPosition);
  }, [replay, currentIndex, currentPosition]);

  const bounds = useMemo(() => {
    return getReplayBounds(replay);
  }, [replay]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !bounds) return;
    if (cameraMode !== "intro-overview" && cameraMode !== "outro-overview") {
      return;
    }

    mapRef.current.resize();
    mapRef.current.fitBounds(bounds, {
      padding: {
        top: 150,
        right: 24,
        bottom: 90,
        left: 24
      },
      duration: 900
    });
  }, [isMapReady, bounds, cameraMode]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !replay) return;
    if (cameraMode !== "focus-start") return;

    const startCoordinate = replay.lineCoordinates[0];
    if (!startCoordinate) return;

    mapRef.current.easeTo({
      center: startCoordinate,
      zoom: 16,
      duration: 850,
      essential: true
    });
  }, [isMapReady, replay, cameraMode]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    if (!currentPosition) {
      if (replayMarkerRef.current) {
        replayMarkerRef.current.remove();
        replayMarkerRef.current = null;
      }
      return;
    }

    const lngLat: [number, number] = [currentPosition.lng, currentPosition.lat];

    if (!replayMarkerRef.current) {
      const el = createReplayMarkerElement();

      replayMarkerRef.current = new maplibregl.Marker({
        element: el,
        anchor: "center"
      })
        .setLngLat(lngLat)
        .addTo(mapRef.current);
    } else {
      replayMarkerRef.current.setLngLat(lngLat);
    }
  }, [isMapReady, currentPosition]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !currentPosition) return;
    if (cameraMode !== "follow") return;

    const enteredFollow = previousCameraModeRef.current !== "follow";

    mapRef.current.easeTo({
      center: [currentPosition.lng, currentPosition.lat],
      zoom: enteredFollow ? 16 : undefined,
      duration: enteredFollow ? 450 : 250,
      essential: true
    });
  }, [isMapReady, currentPosition, cameraMode]);

  useEffect(() => {
    previousCameraModeRef.current = cameraMode;
  }, [cameraMode]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    renderSummitMarkers(mapRef.current, visibleSummits, summitMarkerRefs);

    return () => {
      clearSummitMarkers(summitMarkerRefs);
    };
  }, [isMapReady, visibleSummits]);

  useEffect(() => {
    return () => {
      if (replayMarkerRef.current) {
        replayMarkerRef.current.remove();
        replayMarkerRef.current = null;
      }
      clearSummitMarkers(summitMarkerRefs);
    };
  }, []);

  if (!replay || replay.lineCoordinates.length === 0) {
    return (
      <div className="absolute inset-0 z-0 flex items-center justify-center px-6 text-center">
        <div className="rounded-3xl bg-white/88 px-5 py-4 shadow-sm backdrop-blur">
          <p className="text-heading text-base font-semibold">
            표시할 리플레이 경로가 없습니다
          </p>
          <p className="text-body/80 mt-2 text-sm">
            저장된 리플레이 포인트가 있으면 이 영역에 경로가 표시됩니다.
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
        showAttributionControl={false}
        lineColor="#89943D"
        lineWidth={5}
        pointColor="#4A521E"
        pointStrokeColor="#F7F7F6"
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
