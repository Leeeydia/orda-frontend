import { useState } from "react";
import { useGPS } from "@/features/gps/hooks/useGPS";
import {
  startHiking,
  endHiking,
  verifySummit,
  saveGpsTrack
} from "../api/hikingApi";

export function useHiking() {
  const gps = useGPS();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await startHiking({ userId: 1 }); // TODO: auth 후 교체
      const newSessionId = res.sessionId;
      setSessionId(newSessionId);

      gps.start((point) => {
        // GPS 포인트 수신마다 백엔드에 저장
        saveGpsTrack(newSessionId, {
          latitude: point.lat,
          longitude: point.lng,
          elevationM: point.altitude,
          accuracyM: point.accuracy
        }).catch((e) => {
          console.error("GPS 저장 실패:", e);
        });
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
    trail: gps.trail,
    isTracking: gps.isTracking,
    sessionId,
    isLoading,
    error: error ?? gps.error,
    start,
    stop,
    verify
  };
}
