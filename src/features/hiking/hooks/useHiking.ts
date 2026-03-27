/**
 * 📄 src/features/hiking/hooks/useHiking.ts
 *
 * 변경 사항:
 *  - start(): GPS 첫 fix 확보 후에만 startHiking API 호출 + true 반환
 *    → GPS 못 잡혔는데 hiking 상태로 전환되는 문제 방지
 *  - end(): 실패 시 sessionIdRef 복구로 beforeunload fallback 보장
 */

import { useState, useRef, useEffect } from "react";
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

const SAVE_INTERVAL_MS = 5000;

export const useHiking = () => {
  const gps = useGPS();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedPointCount, setSavedPointCount] = useState(0);

  const lastSavedAt = useRef<number>(0);
  const isFirstPoint = useRef<boolean>(true);
  const sessionIdRef = useRef<number | null>(null);

  // 페이지 닫기 시 자동 종료 (beforeunload만 적용, 앱 전환은 등산 유지)
  useEffect(() => {
    const sendEndBeacon = () => {
      if (sessionIdRef.current) {
        navigator.sendBeacon(`/api/hiking/${sessionIdRef.current}/end`);
      }
    };

    window.addEventListener("beforeunload", sendEndBeacon);
    return () => {
      window.removeEventListener("beforeunload", sendEndBeacon);
    };
  }, []);

  // GPS 첫 fix 확보 후에만 세션 생성 + hiking 전환
  const start = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. GPS 첫 fix 확보 대기 (실패 시 reject → catch로 이동)
      await gps.start((point) => {
        const now = Date.now();

        // 첫 번째 포인트 무조건 저장
        if (isFirstPoint.current) {
          isFirstPoint.current = false;
          lastSavedAt.current = now;
          if (sessionIdRef.current) {
            saveGpsTrack(sessionIdRef.current, {
              latitude: point.lat,
              longitude: point.lng,
              elevationM: point.altitude ?? null,
              accuracyM: point.accuracy
            })
              .then(() => setSavedPointCount((prev) => prev + 1))
              .catch((e) => console.error("GPS 저장 실패 (첫 포인트):", e));
          }
          return;
        }

        // 이후 5초 간격 저장
        if (now - lastSavedAt.current < SAVE_INTERVAL_MS) return;
        lastSavedAt.current = now;

        if (sessionIdRef.current) {
          saveGpsTrack(sessionIdRef.current, {
            latitude: point.lat,
            longitude: point.lng,
            elevationM: point.altitude ?? null,
            accuracyM: point.accuracy
          })
            .then(() => setSavedPointCount((prev) => prev + 1))
            .catch((e) => console.error("GPS 저장 실패:", e));
        }
      });

      // 2. GPS fix 확보 후 세션 생성
      const res = await startHiking({ userId: 1 }); // TODO: auth 연동 후 교체
      const newSessionId = res.sessionId;
      setSessionId(newSessionId);
      sessionIdRef.current = newSessionId;

      lastSavedAt.current = 0;
      isFirstPoint.current = true;
      setSavedPointCount(0);

      return true;
    } catch {
      setError("등산 시작에 실패했습니다. GPS 권한을 확인해주세요.");
      gps.stop();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const end = async (): Promise<boolean> => {
    if (!sessionId) return false;

    // beforeunload 중복 호출 방지를 위해 ref를 먼저 초기화
    const currentSessionId = sessionId;
    sessionIdRef.current = null;

    try {
      setIsLoading(true);
      setError(null);

      // 마지막 포인트 무조건 저장
      if (gps.currentPos) {
        await saveGpsTrack(currentSessionId, {
          latitude: gps.currentPos.lat,
          longitude: gps.currentPos.lng,
          elevationM: gps.currentPos.altitude ?? null,
          accuracyM: gps.currentPos.accuracy
        });
        setSavedPointCount((prev) => prev + 1);
      }

      await endHiking(currentSessionId);
      gps.stop();
      setSessionId(null);
      lastSavedAt.current = 0;
      isFirstPoint.current = true;
      setSavedPointCount(0);

      return true;
    } catch {
      // 실패 시 ref 복구 → beforeunload fallback 및 재시도 가능하도록
      sessionIdRef.current = currentSessionId;
      setError("등산 종료에 실패했습니다.");
      throw new Error("등산 종료에 실패했습니다.");
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
    trail: gps.trail,
    distanceKm: gps.distanceKm,
    elevGain: gps.elevGain,
    currentAltitude: gps.currentAltitude,
    sessionId,
    isLoading,
    error: error ?? gps.error,
    savedPointCount,
    start,
    end,
    verify
  };
};

export const useHikingSessionDetail = (sessionId: number | null) => {
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
};
