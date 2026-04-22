import { useMemo } from "react";
import type {
  ReplaySessionModel,
  ReplayTrackPoint
} from "../types/hiking.types";

type ReplayCurrentPosition = {
  lat: number;
  lng: number;
};

type UseReplayPlayerParams = {
  replay: ReplaySessionModel | null;
  replaySeconds: number;
};

type UseReplayPlayerResult = {
  currentPoint: ReplayTrackPoint | null;
  currentIndex: number;
  currentPosition: ReplayCurrentPosition | null;
};

const EMPTY_TRACK_POINTS: ReplayTrackPoint[] = [];

function interpolateNumber(from: number, to: number, ratio: number) {
  return from + (to - from) * ratio;
}

function interpolateNullableNumber(
  from: number | null,
  to: number | null,
  ratio: number
) {
  if (from == null && to == null) return null;
  if (from == null) return to;
  if (to == null) return from;

  return interpolateNumber(from, to, ratio);
}

function interpolateTrackPoint(
  from: ReplayTrackPoint,
  to: ReplayTrackPoint,
  ratio: number
): ReplayTrackPoint {
  return {
    lat: interpolateNumber(from.lat, to.lat, ratio),
    lng: interpolateNumber(from.lng, to.lng, ratio),
    elevationM: interpolateNullableNumber(from.elevationM, to.elevationM, ratio),
    distanceFromStartM: interpolateNumber(
      from.distanceFromStartM,
      to.distanceFromStartM,
      ratio
    ),
    actualElapsedSeconds: interpolateNullableNumber(
      from.actualElapsedSeconds,
      to.actualElapsedSeconds,
      ratio
    ),
    replayElapsedSeconds: interpolateNumber(
      from.replayElapsedSeconds,
      to.replayElapsedSeconds,
      ratio
    )
  };
}

function smoothReplayTrackPoints(
  points: ReplayTrackPoint[],
  iterations = 3
): ReplayTrackPoint[] {
  if (points.length < 3) {
    return points;
  }

  let smoothedPoints = points;

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const nextPoints: ReplayTrackPoint[] = [smoothedPoints[0]];

    for (let i = 0; i < smoothedPoints.length - 1; i += 1) {
      const current = smoothedPoints[i];
      const next = smoothedPoints[i + 1];

      nextPoints.push(interpolateTrackPoint(current, next, 0.25));
      nextPoints.push(interpolateTrackPoint(current, next, 0.75));
    }

    nextPoints.push(smoothedPoints[smoothedPoints.length - 1]);
    smoothedPoints = nextPoints;
  }

  return smoothedPoints;
}

function findCurrentIndex(
  points: ReplayTrackPoint[],
  currentReplaySeconds: number
): number {
  if (points.length === 0) return -1;

  let currentIndex = 0;

  for (let i = 0; i < points.length; i += 1) {
    if (points[i].replayElapsedSeconds <= currentReplaySeconds) {
      currentIndex = i;
    } else {
      break;
    }
  }

  return currentIndex;
}

function interpolatePosition(
  currentPoint: ReplayTrackPoint | null,
  nextPoint: ReplayTrackPoint | null,
  currentReplaySeconds: number
): ReplayCurrentPosition | null {
  if (!currentPoint) return null;

  if (!nextPoint) {
    return {
      lat: currentPoint.lat,
      lng: currentPoint.lng
    };
  }

  const startTime = currentPoint.replayElapsedSeconds;
  const endTime = nextPoint.replayElapsedSeconds;

  if (endTime <= startTime) {
    return {
      lat: currentPoint.lat,
      lng: currentPoint.lng
    };
  }

  const rawRatio = (currentReplaySeconds - startTime) / (endTime - startTime);

  const ratio = Math.min(Math.max(rawRatio, 0), 1);

  return {
    lat: interpolateNumber(currentPoint.lat, nextPoint.lat, ratio),
    lng: interpolateNumber(currentPoint.lng, nextPoint.lng, ratio)
  };
}

export const useReplayPlayer = ({
  replay,
  replaySeconds
}: UseReplayPlayerParams): UseReplayPlayerResult => {
  const trackPoints = replay?.trackPoints ?? EMPTY_TRACK_POINTS;
  const displayTrackPoints = useMemo(() => {
    return smoothReplayTrackPoints(trackPoints);
  }, [trackPoints]);

  const currentIndex = useMemo(() => {
    return findCurrentIndex(trackPoints, replaySeconds);
  }, [trackPoints, replaySeconds]);

  const currentPoint = useMemo(() => {
    if (currentIndex < 0 || currentIndex >= trackPoints.length) {
      return null;
    }
    return trackPoints[currentIndex];
  }, [trackPoints, currentIndex]);

  const displayIndex = useMemo(() => {
    return findCurrentIndex(displayTrackPoints, replaySeconds);
  }, [displayTrackPoints, replaySeconds]);

  const displayPoint = useMemo(() => {
    if (displayIndex < 0 || displayIndex >= displayTrackPoints.length) {
      return null;
    }
    return displayTrackPoints[displayIndex];
  }, [displayTrackPoints, displayIndex]);

  const nextDisplayPoint = useMemo(() => {
    const nextIndex = displayIndex + 1;
    if (nextIndex >= displayTrackPoints.length) {
      return null;
    }
    return displayTrackPoints[nextIndex];
  }, [displayTrackPoints, displayIndex]);

  const currentPosition = useMemo(() => {
    return interpolatePosition(displayPoint, nextDisplayPoint, replaySeconds);
  }, [displayPoint, nextDisplayPoint, replaySeconds]);

  return {
    currentPoint,
    currentIndex,
    currentPosition
  };
};
