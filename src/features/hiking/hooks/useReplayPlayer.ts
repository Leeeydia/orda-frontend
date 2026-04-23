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

  const currentIndex = useMemo(() => {
    return findCurrentIndex(trackPoints, replaySeconds);
  }, [trackPoints, replaySeconds]);

  const currentPoint = useMemo(() => {
    if (currentIndex < 0 || currentIndex >= trackPoints.length) {
      return null;
    }
    return trackPoints[currentIndex];
  }, [trackPoints, currentIndex]);

  const nextPoint = useMemo(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= trackPoints.length) {
      return null;
    }
    return trackPoints[nextIndex];
  }, [trackPoints, currentIndex]);

  const currentPosition = useMemo(() => {
    return interpolatePosition(currentPoint, nextPoint, replaySeconds);
  }, [currentPoint, nextPoint, replaySeconds]);

  return {
    currentPoint,
    currentIndex,
    currentPosition
  };
};
