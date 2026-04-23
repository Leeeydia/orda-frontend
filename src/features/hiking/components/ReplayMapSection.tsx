import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type CameraState = {
  center: [number, number];
  zoom: number;
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
  sequenceElapsedMs: number;
  introOverviewMs: number;
  startFocusMs: number;
  replayEndMs: number;
  outroOverviewMs: number;
};

const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: []
};

const OVERVIEW_PADDING = {
  top: 150,
  right: 24,
  bottom: 90,
  left: 24
} as const;

const FOCUS_START_ZOOM = 16;
const FOLLOW_ZOOM = 16;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function interpolateNumber(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

function interpolateLngLat(
  from: [number, number],
  to: [number, number],
  t: number
): [number, number] {
  return [
    interpolateNumber(from[0], to[0], t),
    interpolateNumber(from[1], to[1], t)
  ];
}

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

function getOverviewCameraState(
  map: maplibregl.Map,
  bounds: [[number, number], [number, number]]
): CameraState | null {
  const camera = map.cameraForBounds(bounds, {
    padding: OVERVIEW_PADDING
  });

  if (!camera || !camera.center || typeof camera.zoom !== "number") {
    return null;
  }

  const center = maplibregl.LngLat.convert(camera.center);

  return {
    center: [center.lng, center.lat],
    zoom: camera.zoom
  };
}

export default function ReplayMapSection({
  replay,
  currentPosition,
  currentIndex = -1,
  cameraMode,
  visibleSummits = [],
  sequenceElapsedMs,
  introOverviewMs,
  startFocusMs,
  replayEndMs,
  outroOverviewMs
}: ReplayMapSectionProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const replayMarkerRef = useRef<maplibregl.Marker | null>(null);
  const summitMarkerRefs = useRef<Map<string, maplibregl.Marker>>(new Map());
  const outroStartCenterRef = useRef<[number, number] | null>(null);
  const overviewCameraCacheRef = useRef<{
    key: string;
    camera: CameraState | null;
  } | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [cameraLayoutVersion, setCameraLayoutVersion] = useState(0);

  const displayGeoJson = useMemo(() => {
    return getReplayDisplayGeoJson(replay, currentIndex, currentPosition);
  }, [replay, currentIndex, currentPosition]);

  const bounds = useMemo(() => {
    return getReplayBounds(replay);
  }, [replay]);

  const boundsKey = useMemo(() => {
    if (!bounds) return "";

    return `${bounds[0][0]},${bounds[0][1]},${bounds[1][0]},${bounds[1][1]}`;
  }, [bounds]);

  const startCoordinate = useMemo(() => {
    if (!replay || replay.lineCoordinates.length === 0) {
      return null;
    }

    return replay.lineCoordinates[0];
  }, [replay]);

  const endCoordinate = useMemo(() => {
    if (!replay || replay.lineCoordinates.length === 0) {
      return null;
    }

    return replay.lineCoordinates[replay.lineCoordinates.length - 1];
  }, [replay]);

  const getCachedOverviewCamera = useCallback(() => {
    if (!mapRef.current || !bounds) return null;

    const cacheKey = `${boundsKey}:${cameraLayoutVersion}`;
    if (overviewCameraCacheRef.current?.key === cacheKey) {
      return overviewCameraCacheRef.current.camera;
    }

    const camera = getOverviewCameraState(mapRef.current, bounds);
    overviewCameraCacheRef.current = {
      key: cacheKey,
      camera
    };

    return camera;
  }, [bounds, boundsKey, cameraLayoutVersion]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    if (cameraMode !== "intro-overview") return;
    const overviewCamera = getCachedOverviewCamera();
    if (!overviewCamera) return;

    const map = mapRef.current;
    map.stop();

    map.jumpTo({
      center: overviewCamera.center,
      zoom: overviewCamera.zoom
    });
  }, [isMapReady, cameraMode, getCachedOverviewCamera]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    if (cameraMode !== "focus-start") return;
    const overviewCamera = getCachedOverviewCamera();
    if (!overviewCamera || !startCoordinate) return;

    const rawProgress =
      startFocusMs <= 0
        ? 1
        : (sequenceElapsedMs - introOverviewMs) / startFocusMs;

    const progress = easeInOutCubic(clamp(rawProgress, 0, 1));

    const map = mapRef.current;
    map.stop();

    map.jumpTo({
      center: interpolateLngLat(
        overviewCamera.center,
        startCoordinate,
        progress
      ),
      zoom: interpolateNumber(overviewCamera.zoom, FOCUS_START_ZOOM, progress)
    });
  }, [
    isMapReady,
    cameraMode,
    getCachedOverviewCamera,
    startCoordinate,
    sequenceElapsedMs,
    introOverviewMs,
    startFocusMs
  ]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    if (cameraMode !== "follow") return;
    if (!currentPosition) return;

    const map = mapRef.current;
    map.stop();

    map.jumpTo({
      center: [currentPosition.lng, currentPosition.lat],
      zoom: FOLLOW_ZOOM
    });
  }, [isMapReady, cameraMode, currentPosition]);

  useEffect(() => {
    if (!isMapReady) return;

    if (cameraMode !== "outro-overview") {
      outroStartCenterRef.current = null;
      return;
    }

    const overviewCamera = getCachedOverviewCamera();
    if (outroStartCenterRef.current || !overviewCamera) return;

    outroStartCenterRef.current =
      currentPosition != null
        ? [currentPosition.lng, currentPosition.lat]
        : (endCoordinate ?? overviewCamera.center);
  }, [
    isMapReady,
    cameraMode,
    currentPosition,
    endCoordinate,
    getCachedOverviewCamera
  ]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    if (cameraMode !== "outro-overview") return;
    const overviewCamera = getCachedOverviewCamera();
    if (!overviewCamera) return;

    const rawProgress =
      outroOverviewMs <= 0
        ? 1
        : (sequenceElapsedMs - replayEndMs) / outroOverviewMs;

    const progress = easeInOutCubic(clamp(rawProgress, 0, 1));
    const outroStartCenter =
      outroStartCenterRef.current ?? endCoordinate ?? overviewCamera.center;

    const map = mapRef.current;
    map.stop();

    map.jumpTo({
      center: interpolateLngLat(
        outroStartCenter,
        overviewCamera.center,
        progress
      ),
      zoom: interpolateNumber(FOLLOW_ZOOM, overviewCamera.zoom, progress)
    });
  }, [
    isMapReady,
    cameraMode,
    getCachedOverviewCamera,
    endCoordinate,
    sequenceElapsedMs,
    replayEndMs,
    outroOverviewMs
  ]);

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
    if (!isMapReady || !mapRef.current) return;

    renderSummitMarkers(mapRef.current, visibleSummits, summitMarkerRefs);
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
            setCameraLayoutVersion((prev) => prev + 1);
          }, 0);
        }}
      />
    </div>
  );
}
