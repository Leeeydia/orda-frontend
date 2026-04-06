/**
 * 📄 src/pages/hiking/HikingRecordPage.tsx
 */

import { useState, useEffect, useRef } from "react";
import GpsTrackingMap from "@/features/gps/components/GpsTrackingMap";
import { useHiking } from "@/features/hiking/hooks/useHiking";
import type { GpsPoint } from "@/features/gps/types/gps.types";
import Header from "@/components/layout/Header";
import BackButton from "@/components/layout/BackButton";

const useElapsedTime = (isRunning: boolean) => {
  const [seconds, setSeconds] = useState(0);
  const [lastSeconds, setLastSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      startTimeRef.current = null;
      return;
    }
    startTimeRef.current = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - (startTimeRef.current ?? Date.now())) / 1000
      );
      setSeconds(elapsed);
      setLastSeconds(elapsed);
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  return isRunning ? seconds : lastSeconds;
};

const formatTime = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const ElevationChart = ({ trail }: { trail: GpsPoint[] }) => {
  const elevations = trail
    .map((p) => p.altitude)
    .filter((a): a is number => a != null);

  if (elevations.length < 2) {
    return (
      <div className="relative flex h-20 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900/50">
        <span className="text-xs text-slate-400">고도 데이터 수집 중...</span>
      </div>
    );
  }

  const min = Math.min(...elevations);
  const max = Math.max(...elevations);
  const range = max - min || 1;
  const w = 100;
  const h = 80;

  const points = elevations.map((e, i) => ({
    x: (i / (elevations.length - 1)) * w,
    y: h - ((e - min) / range) * (h - 10) - 5
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const fillD = `${pathD} L ${w} ${h} L 0 ${h} Z`;

  return (
    <div className="relative h-20 w-full overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900/50">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full">
        <path d={fillD} fill="rgba(137,148,61,0.2)" />
        <path
          d={pathD}
          fill="none"
          stroke="#89943d"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="absolute top-[10%] right-[2%] size-2.5 rounded-full border-2 border-white bg-[#89943d] shadow-sm ring-4 ring-[#89943d]/20" />
    </div>
  );
};

const StatItem = ({
  label,
  value,
  unit,
  bordered
}: {
  label: string;
  value: string | number;
  unit: string;
  bordered?: "both";
}) => (
  <div
    className={`flex flex-col items-center ${bordered === "both" ? "border-x border-slate-50 dark:border-slate-800" : ""}`}>
    <span className="mb-1 text-[10px] font-bold text-[#89943d] uppercase">
      {label}
    </span>
    <div className="flex items-baseline gap-0.5">
      <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {value}
      </span>
      <span className="text-xs font-medium text-slate-400">{unit}</span>
    </div>
  </div>
);

type PageState = "idle" | "hiking" | "finished";

const HikingRecordPage = () => {
  const {
    geoJson,
    currentPos,
    isLoading,
    error,
    trail,
    distanceKm,
    elevGain,
    currentAltitude,
    start,
    end,
    verify
  } = useHiking();

  const [pageState, setPageState] = useState<PageState>("idle");
  const [summitResult, setSummitResult] = useState<{
    verified: boolean;
    summitName?: string;
    distanceM?: number;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const elapsedSeconds = useElapsedTime(pageState === "hiking");

  const handleStart = async () => {
    const success = await start();
    if (success) setPageState("hiking");
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const result = await verify();
      if (result) {
        setSummitResult({
          verified: result.verified,
          summitName: result.summitName,
          distanceM: result.distanceM
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEnd = async () => {
    try {
      await end();
      setPageState("finished");
      setShowFinishConfirm(false);
    } catch {
      setShowFinishConfirm(false);
    }
  };

  return (
    <div
      className="relative mx-auto flex flex-col overflow-hidden bg-[#f7f7f6] dark:bg-[#1c1d15]"
      style={{
        maxWidth: 390,
        minHeight: "max(884px, 100dvh)",
        height: "100dvh"
      }}>
      {/* ── 지도 배경 ────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <GpsTrackingMap geoJson={geoJson} currentPos={currentPos} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(247,247,246,0.8) 0%, rgba(247,247,246,0) 20%, rgba(247,247,246,0) 80%, rgba(247,247,246,1) 100%)"
          }}
        />
      </div>

      {/* ── 공통 헤더 ────────────────────────────── */}
      <div className="relative z-10">
        <Header leftSlot={<BackButton />} title="등산 기록" />
      </div>

      {/* ── 하단 패널 ────────────────────────────── */}
      <div className="relative z-10 mt-auto w-full rounded-t-[2.5rem] border-t border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#1c1d15]">
        <div className="flex justify-center py-3">
          <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="space-y-6 px-6 pb-8">
          {pageState === "idle" && (
            <div className="flex flex-col items-center space-y-2 py-4">
              <span className="text-4xl">⛰</span>
              <p className="text-sm text-slate-400">
                버튼을 눌러 등산을 시작하세요
              </p>
            </div>
          )}

          {(pageState === "hiking" || pageState === "finished") && (
            <>
              <div className="flex flex-col items-center">
                <span className="mb-1 text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
                  Time
                </span>
                <span className="text-5xl font-bold tracking-tighter text-slate-900 tabular-nums dark:text-slate-100">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 border-y border-slate-50 py-6 dark:border-slate-800">
                <StatItem
                  label="이동 거리"
                  value={distanceKm.toFixed(2)}
                  unit="km"
                />
                <StatItem
                  label="누적 상승"
                  value={elevGain}
                  unit="m"
                  bordered="both"
                />
                <StatItem
                  label="현재 고도"
                  value={
                    currentAltitude != null
                      ? currentAltitude.toLocaleString()
                      : "—"
                  }
                  unit={currentAltitude != null ? "m" : ""}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  <span>고도 변화</span>
                  {pageState === "hiking" && (
                    <span className="text-[#89943d]">Live</span>
                  )}
                </div>
                <ElevationChart trail={trail} />
              </div>

              {summitResult && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-medium ${
                    summitResult.verified
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}>
                  {summitResult.verified
                    ? `🏔 ${summitResult.summitName ?? "정상"} 인증 완료`
                    : `📍 정상까지 약 ${summitResult.distanceM ?? "—"}m 남음`}
                </div>
              )}
            </>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {pageState === "idle" && (
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="flex w-full flex-col items-center justify-center gap-1 rounded-2xl bg-[#89943d] px-6 py-4 font-bold text-white shadow-lg shadow-[#89943d]/30 transition-all active:scale-95 disabled:opacity-60">
              <span className="material-symbols-outlined text-3xl">hiking</span>
              <span className="text-xs tracking-widest uppercase">
                {isLoading ? "연결 중..." : "등산 시작"}
              </span>
            </button>
          )}

          {pageState === "hiking" && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleVerify}
                disabled={isVerifying || !currentPos}
                className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl bg-slate-100 px-6 py-4 font-bold text-slate-900 transition-all active:scale-95 disabled:opacity-40 dark:bg-slate-800 dark:text-white">
                <span className="material-symbols-outlined text-3xl">
                  {isVerifying ? "autorenew" : "landscape"}
                </span>
                <span className="text-xs tracking-widest uppercase">
                  {isVerifying ? "인증 중..." : "정상 인증"}
                </span>
              </button>
              <button
                onClick={() => setShowFinishConfirm(true)}
                className="flex flex-[1.5] flex-col items-center justify-center gap-1 rounded-2xl bg-[#89943d] px-6 py-4 font-bold text-white shadow-lg shadow-[#89943d]/30 transition-all active:scale-95">
                <span className="material-symbols-outlined text-3xl">stop</span>
                <span className="text-xs tracking-widest uppercase">
                  Finish
                </span>
              </button>
            </div>
          )}

          {pageState === "finished" && (
            <button
              onClick={() => {
                setPageState("idle");
                setSummitResult(null);
              }}
              className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white transition-all active:scale-95 dark:bg-slate-100 dark:text-slate-900">
              홈으로
            </button>
          )}
        </div>

        <div className="flex h-6 items-center justify-center">
          <div className="h-1 w-32 rounded-full bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>

      {/* ── 종료 확인 바텀시트 ───────────────────── */}
      {showFinishConfirm && (
        <div
          className="absolute inset-0 z-20 flex items-end bg-black/50"
          onClick={() => setShowFinishConfirm(false)}>
          <div
            className="w-full rounded-t-3xl bg-white px-6 pt-5 pb-10 dark:bg-[#1c1d15]"
            onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
            <h2 className="mb-1 text-center text-xl font-bold text-slate-900 dark:text-slate-100">
              등산을 종료할까요?
            </h2>
            <p className="mb-6 text-center text-sm text-slate-400">
              {formatTime(elapsedSeconds)} 동안 {distanceKm.toFixed(2)}km 이동
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 rounded-2xl border border-slate-200 py-4 text-sm font-medium text-slate-500 dark:border-slate-700">
                계속하기
              </button>
              <button
                onClick={handleEnd}
                disabled={isLoading}
                className="flex-1 rounded-2xl bg-[#89943d] py-4 text-sm font-bold text-white disabled:opacity-60">
                {isLoading ? "저장 중..." : "기록 저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HikingRecordPage;
