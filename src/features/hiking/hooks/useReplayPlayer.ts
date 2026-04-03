import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ReplaySessionModel,
  ReplayTrackPoint
} from "../types/hiking.types";

type ReplayCurrentPosition = {
  lat: number;
  lng: number;
};

type UseReplayPlayerResult = {
  isPlaying: boolean;
  currentReplaySeconds: number;
  durationSeconds: number;
  currentPoint: ReplayTrackPoint | null;
  currentIndex: number;
  currentPosition: ReplayCurrentPosition | null;
  progress: number;
  play: () => void;
  pause: () => void;
  reset: () => void;
};

const TICK_MS = 50;

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
    lat: currentPoint.lat + (nextPoint.lat - currentPoint.lat) * ratio,
    lng: currentPoint.lng + (nextPoint.lng - currentPoint.lng) * ratio
  };
}

export const useReplayPlayer = (
  replay: ReplaySessionModel | null
): UseReplayPlayerResult => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentReplaySeconds, setCurrentReplaySeconds] = useState(0);

  const intervalRef = useRef<number | null>(null);

  const durationSeconds = replay?.durationSeconds ?? 0;
  const trackPoints = replay?.trackPoints ?? [];

  const currentIndex = useMemo(() => {
    return findCurrentIndex(trackPoints, currentReplaySeconds);
  }, [trackPoints, currentReplaySeconds]);

  const currentPoint = useMemo(() => {
    if (currentIndex < 0 || currentIndex >= trackPoints.length) {
      return null;
    }
    return trackPoints[currentIndex];
  }, [trackPoints, currentIndex]);

  const nextPoint = useMemo(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= trackPoints.length) {
      return null;
    }
    return trackPoints[nextIndex];
  }, [trackPoints, currentIndex]);

  const currentPosition = useMemo(() => {
    return interpolatePosition(
      currentPoint,
      nextPoint,
      currentReplaySeconds
    );
  }, [currentPoint, nextPoint, currentReplaySeconds]);

  const progress = useMemo(() => {
    if (durationSeconds <= 0) return 0;
    return Math.min(currentReplaySeconds / durationSeconds, 1);
  }, [currentReplaySeconds, durationSeconds]);

  useEffect(() => {
    if (!isPlaying) return;
    if (durationSeconds <= 0) return;

    intervalRef.current = window.setInterval(() => {
      setCurrentReplaySeconds((prev) => {
        const next = prev + TICK_MS / 1000;

        if (next >= durationSeconds) {
          setIsPlaying(false);
          return durationSeconds;
        }

        return next;
      });
    }, TICK_MS);

    return () => {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, durationSeconds]);

  const play = () => {
    if (durationSeconds <= 0) return;

    if (currentReplaySeconds >= durationSeconds) {
      setCurrentReplaySeconds(0);
    }

    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentReplaySeconds(0);
  };

  return {
    isPlaying,
    currentReplaySeconds,
    durationSeconds,
    currentPoint,
    currentIndex,
    currentPosition,
    progress,
    play,
    pause,
    reset
  };
};