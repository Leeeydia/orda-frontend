import type { FeatureCollection, LineString, Point } from "geojson";
import type {
  ElevationProfilePointResponse,
  HikingTrackFeature,
  HikingTrackFeatureCollection,
  ReplayResponse,
  ReplaySessionModel,
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

  const features: FeatureCollection["features"] = [];

  if (coordinates.length >= 2) {
    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates
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

export const mapElevationPointsToSvgPath = (
  points: ElevationProfilePointResponse[],
  width = 320,
  height = 120
): string => {
  if (!points || points.length === 0) return "";

  if (points.length === 1) {
    const x = 0;
    const y = height / 2;
    return `M ${x} ${y}`;
  }

  const distances = points.map((point) => point.cumulativeDistanceMeters);
  const elevations = points.map((point) => point.elevationMeters);

  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);
  const minElevation = Math.min(...elevations);
  const maxElevation = Math.max(...elevations);

  const distanceRange = maxDistance - minDistance || 1;
  const elevationRange = maxElevation - minElevation || 1;

  return points
    .map((point, index) => {
      const x =
        ((point.cumulativeDistanceMeters - minDistance) / distanceRange) *
        width;
      const y =
        height -
        ((point.elevationMeters - minElevation) / elevationRange) * height;

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
};

export const getElevationProfileSummary = (
  points: ElevationProfilePointResponse[]
) => {
  if (!points || points.length === 0) {
    return {
      minElevation: null,
      maxElevation: null,
      totalDistance: 0
    };
  }

  const elevations = points.map((point) => point.elevationMeters);
  const distances = points.map((point) => point.cumulativeDistanceMeters);

  return {
    minElevation: Math.min(...elevations),
    maxElevation: Math.max(...elevations),
    totalDistance: Math.max(...distances)
  };
};

const EMPTY_REPLAY_SUMMARY = {
  totalDistanceMeters: 0,
  totalElevationGainMeters: 0,
  totalElevationLossMeters: 0,
  totalElapsedSeconds: 0
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
