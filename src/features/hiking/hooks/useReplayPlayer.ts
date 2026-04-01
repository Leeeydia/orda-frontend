import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ReplaySessionModel,
  ReplayTrackPoint
} from "../types/hiking.types";

type UseReplayPlayerResult = {
  isPlaying: boolean;
  currentReplaySeconds: number;
  durationSeconds: number;
  currentPoint: ReplayTrackPoint | null;
  currentIndex: number;
  progress: number;
  play: () => void;
  pause: () => void;
  reset: () => void;
};

const TICK_MS = 100;

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
    progress,
    play,
    pause,
    reset
  };
};