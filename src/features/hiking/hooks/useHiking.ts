import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGPS } from "@/features/gps/hooks/useGPS";
import {
  startHiking,
  endHiking,
  verifySummit,
  saveGpsTrack,
  getHikingSession,
  getHikingTracks,
  getElevationProfile
} from "../api/hikingApi";

const SAVE_INTERVAL_MS = 5000; // 5초마다 저장

export function useHiking() {
  const gps = useGPS();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedPointCount, setSavedPointCount] = useState(0);

  const lastSavedAt = useRef<number>(0);

  const start = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await startHiking({ userId: 1 }); // TODO: auth 연동 후 교체
      const newSessionId = res.sessionId;
      setSessionId(newSessionId);

      lastSavedAt.current = 0;
      setSavedPointCount(0);

      gps.start((point) => {
        const now = Date.now();
        if (now - lastSavedAt.current < SAVE_INTERVAL_MS) return;
        lastSavedAt.current = now;

        saveGpsTrack(newSessionId, {
          latitude: point.lat,
          longitude: point.lng,
          elevationM: point.altitude ?? null,
          accuracyM: point.accuracy
        })
          .then(() => setSavedPointCount((prev) => prev + 1))
          .catch((e) => console.error("GPS 저장 실패:", e));
      });
    } catch {
      setError("등산 시작에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const stop = async () => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
      setError(null);
      await endHiking(sessionId);
      gps.stop();
      setSessionId(null);
      lastSavedAt.current = 0;
      setSavedPointCount(0);
    } catch {
      setError("등산 종료에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const verify = async () => {
    if (!sessionId || !gps.currentPos) return;
    try {
      setError(null);
      const res = await verifySummit({
        sessionId,
        latitude: gps.currentPos.lat,
        longitude: gps.currentPos.lng
      });
      return res;
    } catch {
      setError("정상 인증에 실패했습니다.");
    }
  };

  return {
    geoJson: gps.geoJson,
    currentPos: gps.currentPos,
    isTracking: gps.isTracking,
    sessionId,
    isLoading,
    error: error ?? gps.error,
    savedPointCount,
    start,
    stop,
    verify
  };
}

export function useHikingSessionDetail(sessionId: number | null) {
  const sessionQuery = useQuery({
    queryKey: ["hiking", "session", sessionId],
    queryFn: () => getHikingSession(sessionId as number),
    enabled: sessionId != null
  });

  const tracksQuery = useQuery({
    queryKey: ["hiking", "tracks", sessionId],
    queryFn: () => getHikingTracks(sessionId as number),
    enabled: sessionId != null
  });

  const elevationProfileQuery = useQuery({
    queryKey: ["hiking", "elevation-profile", sessionId],
    queryFn: () => getElevationProfile(sessionId as number),
    enabled: sessionId != null
  });

  return {
    session: sessionQuery.data ?? null,
    tracks: tracksQuery.data ?? null,
    elevationProfile: elevationProfileQuery.data ?? null,

    sessionQuery,
    tracksQuery,
    elevationProfileQuery,

    isLoading:
      sessionQuery.isLoading ||
      tracksQuery.isLoading ||
      elevationProfileQuery.isLoading,

    isFetching:
      sessionQuery.isFetching ||
      tracksQuery.isFetching ||
      elevationProfileQuery.isFetching,

    isError:
      sessionQuery.isError ||
      tracksQuery.isError ||
      elevationProfileQuery.isError
  };
}