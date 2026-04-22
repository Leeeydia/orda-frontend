import type { FeatureCollection, LineString, Point } from "geojson";
import {
  formatDistanceKm,
  formatDuration,
  formatMeters
} from "@/utils/format";
import type {
  ElevationProfilePointResponse,
  ElevationSummaryStatus,
  HikingTrackFeature,
  HikingTrackFeatureCollection,
  ReplayResponse,
  ReplaySessionModel,
  ReplaySummaryResponse,
  ReplayTrackPoint
} from "../types/hiking.types";

const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: []
};

const sortTrackFeatures = (
  features: HikingTrackFeature[]
): HikingTrackFeature[] => {
  return [...features].sort(
    (a, b) => a.properties.sequenceNum - b.properties.sequenceNum
  );
};

const DEFAULT_LINE_SMOOTHING_ITERATIONS = 3;

type ChartPoint = {
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export const smoothLineCoordinates = (
  coordinates: [number, number][],
  iterations = DEFAULT_LINE_SMOOTHING_ITERATIONS
): [number, number][] => {
  if (coordinates.length < 3) {
    return coordinates;
  }

  const safeIterations = Math.max(Math.round(iterations), 0);
  let smoothedCoordinates = coordinates;

  for (let iteration = 0; iteration < safeIterations; iteration += 1) {
    const nextCoordinates: [number, number][] = [smoothedCoordinates[0]];

    for (let i = 0; i < smoothedCoordinates.length - 1; i += 1) {
      const current = smoothedCoordinates[i];
      const next = smoothedCoordinates[i + 1];

      nextCoordinates.push([
        current[0] * 0.75 + next[0] * 0.25,
        current[1] * 0.75 + next[1] * 0.25
      ]);
      nextCoordinates.push([
        current[0] * 0.25 + next[0] * 0.75,
        current[1] * 0.25 + next[1] * 0.75
      ]);
    }

    nextCoordinates.push(smoothedCoordinates[smoothedCoordinates.length - 1]);
    smoothedCoordinates = nextCoordinates;
  }

  return smoothedCoordinates;
};

function createSmoothSvgPath(points: ChartPoint[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  const pathCommands = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);
    const cp1 = {
      x: p1.x + (p2.x - p0.x) / 6,
      y: clamp(p1.y + (p2.y - p0.y) / 6, minY, maxY)
    };
    const cp2 = {
      x: p2.x - (p3.x - p1.x) / 6,
      y: clamp(p2.y - (p3.y - p1.y) / 6, minY, maxY)
    };

    pathCommands.push(
      `C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p2.x} ${p2.y}`
    );
  }

  return pathCommands.join(" ");
}

function smoothElevationValues(points: ChartPoint[]): ChartPoint[] {
  if (points.length < 5) {
    return points;
  }

  return points.map((point, index) => {
    if (index === 0 || index === points.length - 1) {
      return point;
    }

    const prev = points[index - 1];
    const next = points[index + 1];

    return {
      x: point.x,
      y: prev.y * 0.24 + point.y * 0.52 + next.y * 0.24
    };
  });
}

export const mapTrackFeaturesToDisplayGeoJson = (
  trackFeatureCollection: HikingTrackFeatureCollection | null | undefined
): FeatureCollection => {
  if (!trackFeatureCollection || trackFeatureCollection.features.length === 0) {
    return EMPTY_FEATURE_COLLECTION;
  }

  const sortedFeatures = sortTrackFeatures(trackFeatureCollection.features);

  const coordinates = sortedFeatures.map(
    (feature) => feature.geometry.coordinates
  );
  const displayCoordinates = smoothLineCoordinates(coordinates);

  const features: FeatureCollection["features"] = [];

  if (displayCoordinates.length >= 2) {
    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: displayCoordinates
      } satisfies LineString,
      properties: {
        type: "track-line"
      }
    });
  }

  const startFeature = sortedFeatures[0];
  const endFeature = sortedFeatures[sortedFeatures.length - 1];

  features.push({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: startFeature.geometry.coordinates
    } satisfies Point,
    properties: {
      type: "start-point",
      sequenceNum: startFeature.properties.sequenceNum
    }
  });

  if (sortedFeatures.length > 1) {
    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: endFeature.geometry.coordinates
      } satisfies Point,
      properties: {
        type: "end-point",
        sequenceNum: endFeature.properties.sequenceNum
      }
    });
  }

  return {
    type: "FeatureCollection",
    features
  };
};

export const getTrackBounds = (
  trackFeatureCollection: HikingTrackFeatureCollection | null | undefined
): [[number, number], [number, number]] | null => {
  if (!trackFeatureCollection || trackFeatureCollection.features.length === 0) {
    return null;
  }

  const sortedFeatures = sortTrackFeatures(trackFeatureCollection.features);

  const longitudes = sortedFeatures.map(
    (feature) => feature.geometry.coordinates[0]
  );
  const latitudes = sortedFeatures.map(
    (feature) => feature.geometry.coordinates[1]
  );

  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);

  return [
    [minLng, minLat],
    [maxLng, maxLat]
  ];
};

export const isRenderableElevationPoint = (
  point: ElevationProfilePointResponse
): boolean => {
  return (
    typeof point.elevationMeters === "number" &&
    (point.elevationStatus === "DEM" ||
      point.elevationStatus === "INTERPOLATED")
  );
};

export const mapElevationPointsToSvgPath = (
  points: ElevationProfilePointResponse[],
  width = 320,
  height = 120
): string => {
  if (!points || points.length === 0) return "";

  const renderablePoints = points.filter(isRenderableElevationPoint);
  if (renderablePoints.length === 0) return "";

  // x축은 전체 points 거리 기준을 유지해 결손 구간 위치가 보이도록 한다.
  const distances = points.map((point) => point.cumulativeDistanceMeters);
  const elevations = renderablePoints.map(
    (point) => point.elevationMeters as number
  );

  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);
  const minElevation = Math.min(...elevations);
  const maxElevation = Math.max(...elevations);

  const distanceRange = maxDistance - minDistance || 1;
  const elevationRange = maxElevation - minElevation || 1;

  const pathCommands: string[] = [];
  let segment: ChartPoint[] = [];

  const flushSegment = () => {
    if (segment.length === 0) return;

    pathCommands.push(createSmoothSvgPath(smoothElevationValues(segment)));
    segment = [];
  };

  for (const point of points) {
    if (!isRenderableElevationPoint(point)) {
      flushSegment();
      continue;
    }

    const x =
      ((point.cumulativeDistanceMeters - minDistance) / distanceRange) * width;
    const y =
      height -
      (((point.elevationMeters as number) - minElevation) / elevationRange) *
        height;

    segment.push({ x, y });
  }

  flushSegment();

  return pathCommands.join(" ");
};

export const getElevationProfileSummary = (
  points: ElevationProfilePointResponse[]
): {
  minElevation: number | null;
  maxElevation: number | null;
  totalDistance: number;
} => {
  if (!points || points.length === 0) {
    return {
      minElevation: null,
      maxElevation: null,
      totalDistance: 0
    };
  }

  const renderablePoints = points.filter(isRenderableElevationPoint);
  const distances = points.map((point) => point.cumulativeDistanceMeters);

  return {
    minElevation:
      renderablePoints.length > 0
        ? Math.min(
            ...renderablePoints.map((point) => point.elevationMeters as number)
          )
        : null,
    maxElevation:
      renderablePoints.length > 0
        ? Math.max(
            ...renderablePoints.map((point) => point.elevationMeters as number)
          )
        : null,
    totalDistance: distances.length > 0 ? Math.max(...distances) : 0
  };
};

export const formatDistanceDisplay = (
  distanceMeters: number | null | undefined,
  kmDecimals?: number
) => {
  if (distanceMeters == null || Number.isNaN(distanceMeters)) {
    return "-";
  }

  if (distanceMeters >= 1000) {
    return kmDecimals != null
      ? formatDistanceKm(distanceMeters, kmDecimals)
      : formatDistanceKm(distanceMeters);
  }

  return formatMeters(distanceMeters, 0);
};

export const formatDurationDisplay = (
  totalElapsedSeconds: number | null | undefined
) => {
  if (totalElapsedSeconds == null || Number.isNaN(totalElapsedSeconds)) {
    return "-";
  }

  return formatDuration(totalElapsedSeconds);
};

export const formatElevationDisplay = (
  value: number | null | undefined,
  status: ElevationSummaryStatus | undefined
) => {
  if (value == null || Number.isNaN(value)) {
    return status === "UNAVAILABLE" ? "계산 불가" : "-";
  }

  return formatMeters(value, 0);
};

const EMPTY_REPLAY_SUMMARY: ReplaySummaryResponse = {
  totalDistanceMeters: 0,
  totalElevationGainMeters: null,
  totalElevationLossMeters: null,
  totalElapsedSeconds: 0,
  elevationSummaryStatus: "UNAVAILABLE"
};

export const mapReplayResponseToReplaySessionModel = (
  replayResponse: ReplayResponse | null | undefined
): ReplaySessionModel => {
  if (!replayResponse) {
    return {
      sessionId: 0,
      summary: EMPTY_REPLAY_SUMMARY,
      trackPoints: [],
      lineCoordinates: [],
      durationSeconds: 0,
      totalPoints: 0
    };
  }

  const trackPoints: ReplayTrackPoint[] = (replayResponse.points ?? []).map(
    (point) => ({
      lat: point.latitude,
      lng: point.longitude,
      elevationM: point.elevationM,
      distanceFromStartM: point.distanceFromStartM,
      actualElapsedSeconds: point.actualElapsedSeconds,
      replayElapsedSeconds: point.replayElapsedSeconds
    })
  );

  const lineCoordinates = trackPoints.map(
    (point) => [point.lng, point.lat] as [number, number]
  );

  const lastTrackPoint =
    trackPoints.length > 0 ? trackPoints[trackPoints.length - 1] : null;

  return {
    sessionId: replayResponse.sessionId,
    summary: replayResponse.summary ?? EMPTY_REPLAY_SUMMARY,
    trackPoints,
    lineCoordinates,
    durationSeconds: lastTrackPoint?.replayElapsedSeconds ?? 0,
    totalPoints: trackPoints.length
  };
};

export const getInterpolatedActualElapsedSeconds = (
  trackPoints: ReplayTrackPoint[],
  currentReplaySeconds: number
): number => {
  if (!trackPoints.length) return 0;

  const firstPoint = trackPoints[0];
  const lastPoint = trackPoints[trackPoints.length - 1];

  if (currentReplaySeconds <= 0) {
    return firstPoint.actualElapsedSeconds ?? 0;
  }

  if (currentReplaySeconds >= lastPoint.replayElapsedSeconds) {
    return lastPoint.actualElapsedSeconds ?? 0;
  }

  for (let i = 0; i < trackPoints.length - 1; i++) {
    const startPoint = trackPoints[i];
    const endPoint = trackPoints[i + 1];

    const startReplay = startPoint.replayElapsedSeconds;
    const endReplay = endPoint.replayElapsedSeconds;

    if (
      currentReplaySeconds >= startReplay &&
      currentReplaySeconds <= endReplay
    ) {
      const startActual = startPoint.actualElapsedSeconds ?? 0;
      const endActual = endPoint.actualElapsedSeconds ?? startActual;
      const replayRange = endReplay - startReplay;

      if (replayRange <= 0) {
        return startActual;
      }

      const ratio = (currentReplaySeconds - startReplay) / replayRange;

      return Math.round(startActual + (endActual - startActual) * ratio);
    }
  }

  return lastPoint.actualElapsedSeconds ?? 0;
};

export const mapSequenceToReplaySeconds = (
  sequenceMs: number,
  replayStartMs: number,
  replayEndMs: number,
  replayDurationSec: number
): number => {
  if (replayDurationSec <= 0) return 0;

  if (sequenceMs <= replayStartMs) return 0;
  if (sequenceMs >= replayEndMs) return replayDurationSec;

  const progress = (sequenceMs - replayStartMs) / (replayEndMs - replayStartMs);

  return replayDurationSec * progress;
};

export const mapReplaySecondsToSequenceMs = (
  replaySeconds: number,
  replayStartMs: number,
  replayDurationMs: number,
  replayDurationSec: number
): number => {
  if (replayDurationSec <= 0) return replayStartMs;

  const progress = replaySeconds / replayDurationSec;

  return replayStartMs + progress * replayDurationMs;
};
