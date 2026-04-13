/**
 * 📄 src/features/hiking/hooks/useHiking.ts
 *
 * 변경 사항:
 *  - start(): 첫 GPS fix를 firstFixRef에 임시 보관
 *             세션 생성 후 즉시 첫 포인트 저장 보장
 *  - start(): startHiking 호출 시 GPS 좌표(latitude, longitude) 포함
 *             백엔드 등산로 근접 검증 에러 메시지 표시
 */

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useGPS } from "@/features/gps/hooks/useGPS";
import {
  startHiking,
  endHiking,
  verifySummit,
  saveGpsTrack
} from "../api/hikingApi";
import type { GpsPoint } from "@/features/gps/types/gps.types";
import type { NearbySummitItem } from "../types/hiking.types";

const SAVE_INTERVAL_MS = 5000;

export const useHiking = () => {
  const gps = useGPS();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedPointCount, setSavedPointCount] = useState(0);
  const [nearbySummits, setNearbySummits] = useState<NearbySummitItem[]>([]);

  const lastSavedAt = useRef<number>(0);
  const sessionIdRef = useRef<number | null>(null);
  const firstFixRef = useRef<GpsPoint | null>(null);

  useEffect(() => {
    const sendEndBeacon = () => {
      if (sessionIdRef.current) {
        navigator.sendBeacon(`/api/hiking/${sessionIdRef.current}/end`);
      }
    };
    window.addEventListener("beforeunload", sendEndBeacon);
    return () => window.removeEventListener("beforeunload", sendEndBeacon);
  }, []);

  const start = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      firstFixRef.current = null;

      // 1. GPS fix 확보 대기
      //    첫 fix는 sessionId가 없으므로 저장 불가 → firstFixRef에 임시 보관
      await gps.start((point: GpsPoint) => {
        const now = Date.now();

        if (firstFixRef.current === null) {
          firstFixRef.current = point;
          lastSavedAt.current = now;
          return;
        }

        if (!sessionIdRef.current) return;
        if (now - lastSavedAt.current < SAVE_INTERVAL_MS) return;
        lastSavedAt.current = now;

        saveGpsTrack(sessionIdRef.current, {
          latitude: point.lat,
          longitude: point.lng,
          elevationM: point.altitude ?? null,
          accuracyM: point.accuracy
        })
          .then(() => setSavedPointCount((prev) => prev + 1))
          .catch((e) => console.error("GPS 저장 실패:", e));
      });

      // 2. 등산 시작 요청 (GPS 좌표 포함 → 백엔드에서 등산로 근접 검증)
      const firstFix = firstFixRef.current as GpsPoint | null;
      if (!firstFix) {
        throw new Error("GPS 위치를 확인할 수 없습니다.");
      }

      const res = await startHiking({
        userId: 1, // TODO: auth 연동 후 교체
        latitude: firstFix.lat,
        longitude: firstFix.lng
      });
      const newSessionId = res.sessionId;
      setSessionId(newSessionId);
      sessionIdRef.current = newSessionId;
      setNearbySummits(res.nearbySummits ?? []);

      // 3. 첫 GPS 포인트 저장
      await saveGpsTrack(newSessionId, {
        latitude: firstFix.lat,
        longitude: firstFix.lng,
        elevationM: firstFix.altitude ?? null,
        accuracyM: firstFix.accuracy
      });
      setSavedPointCount(1);
      firstFixRef.current = null;

      return true;
    } catch (e) {
      const message =
        axios.isAxiosError(e) && e.response?.data?.message
          ? e.response.data.message
          : "등산 시작에 실패했습니다. GPS 권한을 확인해주세요.";
      setError(message);
      gps.stop();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const end = async (): Promise<boolean> => {
    if (!sessionId) return false;

    const currentSessionId = sessionId;
    sessionIdRef.current = null;

    try {
      setIsLoading(true);
      setError(null);

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
      firstFixRef.current = null;
      setSavedPointCount(0);
      setNearbySummits([]);

      return true;
    } catch {
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
      return await verifySummit({
        sessionId,
        latitude: gps.currentPos.lat,
        longitude: gps.currentPos.lng
      });
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
    nearbySummits,
    start,
    end,
    verify
  };
};
