/**
 * 📄 src/features/hiking/hooks/useHiking.ts
 *
 * 변경 사항:
 *  - sequenceNumRef: 프론트에서 GPS 포인트 순서 번호를 직접 채번
 *    → 백엔드 max+1 race condition 해결
 *    → 포인트 생성 시점에 즉시 번호 확정 & 증가 (다른 포인트가 같은 번호 공유 방지)
 *    → 같은 포인트의 재시도는 백엔드 멱등성으로 보장
 *  - start(): 첫 GPS fix를 firstFixRef에 임시 보관
 *             세션 생성 후 즉시 첫 포인트 저장 보장
 *  - start(): startHiking 호출 시 GPS 좌표(latitude, longitude) 포함
 *             백엔드 등산로 근접 검증 에러 메시지 표시
 *  - start(): 반환 타입을 { success, errorMessage }로 변경
 *             idle 상태 시작 실패 메시지를 호출자가 토스트로 표시 가능
 *  - demElevations: (number | null)[] 형태로 관리
 *                   dem이면 값, gps_fallback/none이면 null을 push
 *                   → raw GPS 그래프로 fallback하지 않고, 누락 구간은 차트에서 공백으로 표시
 *  - start()/end()에서 demElevations 명시적 초기화 (이전 세션 값 섞임 방지)
 *  - end(): 마지막 saveGpsTrack() 응답도 demElevations에 반영
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
import type {
  NearbySummitItem,
  HikingStartResult,
  GpsTrackSaveResponse
} from "../types/hiking.types";

const SAVE_INTERVAL_MS = 5000;

// saveGpsTrack 응답 → demElevations에 push할 값
// dem이면 값, 그 외(gps_fallback, none)면 null로 표시
function toDemElevationEntry(res: GpsTrackSaveResponse): number | null {
  if (res.elevationSource === "dem" && res.canonicalElevationM != null) {
    return res.canonicalElevationM;
  }
  return null;
}

export const useHiking = () => {
  const gps = useGPS();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedPointCount, setSavedPointCount] = useState(0);
  const [nearbySummits, setNearbySummits] = useState<NearbySummitItem[]>([]);
  const [demElevations, setDemElevations] = useState<(number | null)[]>([]);

  const lastSavedAt = useRef<number>(0);
  const sessionIdRef = useRef<number | null>(null);
  const firstFixRef = useRef<GpsPoint | null>(null);
  const sequenceNumRef = useRef<number>(1);

  useEffect(() => {
    const sendEndBeacon = () => {
      if (sessionIdRef.current) {
        navigator.sendBeacon(`/api/hiking/${sessionIdRef.current}/end`);
      }
    };
    window.addEventListener("beforeunload", sendEndBeacon);
    return () => window.removeEventListener("beforeunload", sendEndBeacon);
  }, []);

  const start = async (): Promise<HikingStartResult> => {
    try {
      setIsLoading(true);
      setError(null);
      firstFixRef.current = null;
      // 이전 세션 상태가 섞이지 않도록 명시적 초기화
      setDemElevations([]);
      setSavedPointCount(0);
      sequenceNumRef.current = 1;

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

        // 포인트 생성 시점에 즉시 번호 확정 & 증가
        // → 다음 포인트는 반드시 다른 번호를 사용
        const seq = sequenceNumRef.current;
        sequenceNumRef.current += 1;

        saveGpsTrack(sessionIdRef.current, {
          sequenceNum: seq,
          latitude: point.lat,
          longitude: point.lng,
          elevationM: point.altitude ?? null,
          accuracyM: point.accuracy
        })
          .then((res) => {
            setSavedPointCount((prev) => prev + 1);
            setDemElevations((prev) => [...prev, toDemElevationEntry(res)]);
          })
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

      // 3. 첫 GPS 포인트 저장 (sequenceNum = 1)
      const firstTrackRes = await saveGpsTrack(newSessionId, {
        sequenceNum: 1,
        latitude: firstFix.lat,
        longitude: firstFix.lng,
        elevationM: firstFix.altitude ?? null,
        accuracyM: firstFix.accuracy
      });
      setSavedPointCount(1);
      setDemElevations([toDemElevationEntry(firstTrackRes)]);
      sequenceNumRef.current = 2;
      firstFixRef.current = null;

      return { success: true };
    } catch (e) {
      const message =
        axios.isAxiosError(e) && e.response?.data?.message
          ? e.response.data.message
          : e instanceof Error
            ? e.message
            : "등산 시작에 실패했습니다. GPS 권한을 확인해주세요.";
      setError(message);
      gps.stop();
      return { success: false, errorMessage: message };
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
        // 마지막 포인트도 즉시 번호 확정 & 증가
        const seq = sequenceNumRef.current;
        sequenceNumRef.current += 1;

        const lastTrackRes = await saveGpsTrack(currentSessionId, {
          sequenceNum: seq,
          latitude: gps.currentPos.lat,
          longitude: gps.currentPos.lng,
          elevationM: gps.currentPos.altitude ?? null,
          accuracyM: gps.currentPos.accuracy
        });
        setSavedPointCount((prev) => prev + 1);
        // 종료 시점 마지막 포인트도 demElevations에 반영
        setDemElevations((prev) => [
          ...prev,
          toDemElevationEntry(lastTrackRes)
        ]);
      }

      await endHiking(currentSessionId);
      gps.stop();
      setSessionId(null);
      lastSavedAt.current = 0;
      firstFixRef.current = null;
      sequenceNumRef.current = 1;
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
    demElevations,
    start,
    end,
    verify
  };
};
