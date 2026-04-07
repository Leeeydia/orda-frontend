/**
 * 📄 src/pages/hiking/HikingRecordPage.tsx
 *
 * 변경 사항:
 *  - [orda/feat/trail-difficulty] BottomNav 추가
 *  - [orda/feat/trail-difficulty] 하단 패널 제거, 등산 시작 버튼 플로팅으로 변경
 *  - [orda/feat/trail-difficulty] 등산로 로딩 오버레이 추가, 버튼 위치 조정
 *  - [orda/feat/trail-difficulty] 등산 시작 버튼 위 배낭맨 아이콘 추가 및 대각선 애니메이션
 *  - [orda/feat/trail-difficulty] idle 상태에서도 내 위치 표시
 *  - [orda/feat/trail-difficulty] 헤더 심플하게 변경 (로고만 표시)
 *  - [orda/feat/trail-difficulty] 내 위치로 돌아오기 버튼 추가
 */

import { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl"; // [orda/feat/trail-difficulty] 추가
import GpsTrackingMap from "@/features/gps/components/GpsTrackingMap";
import { useHiking } from "@/features/hiking/hooks/useHiking";
import { useGPS } from "@/features/gps/hooks/useGPS"; // [orda/feat/trail-difficulty] 추가
import type { GpsPoint } from "@/features/gps/types/gps.types";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

// [orda/feat/trail-difficulty] 배낭맨 아이콘
import hikingIcon from "@/assets/hiking-icon.png";

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
      <div className="relative flex h-20 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50">
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
    <div className="relative h-20 w-full overflow-hidden rounded-xl bg-slate-50">
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
    className={`flex flex-col items-center ${bordered === "both" ? "border-x border-slate-100" : ""}`}>
    <span className="mb-1 text-[10px] font-bold text-[#89943d] uppercase">
      {label}
    </span>
    <div className="flex items-baseline gap-0.5">
      <span className="text-2xl font-bold text-slate-900">{value}</span>
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
  const [trailLoaded, setTrailLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // [orda/feat/trail-difficulty] idle 상태에서도 내 위치 표시용 GPS
  const idleGps = useGPS();
  useEffect(() => {
    if (pageState === "idle") {
      idleGps.start().catch(() => {});
    }
    return () => {
      idleGps.stop();
    };
  }, [pageState]);

  // [orda/feat/trail-difficulty] 내 위치로 돌아오기 버튼용 map 인스턴스
  const mapRef = useRef<maplibregl.Map | null>(null);

  // [orda/feat/trail-difficulty] 현재 위치로 지도 이동
  const handleMoveToCurrentPos = () => {
    const pos = pageState === "idle" ? idleGps.currentPos : currentPos;
    if (!mapRef.current || !pos) return;
    mapRef.current.flyTo({ center: [pos.lng, pos.lat], zoom: 15 });
  };

  const elapsedSeconds = useElapsedTime(pageState === "hiking");

  const handleStartWithAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      handleStart();
    }, 2000);
  };

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
      className="relative mx-auto flex flex-col bg-[#f7f7f6]"
      style={{
        maxWidth: 390,
        minHeight: "max(844px, 100dvh)",
        height: "100dvh"
      }}>
      {/* ── 애니메이션 스타일 ─────────────────────── */}
      <style>{`
        @keyframes diagonalFly {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(60px, -120px); opacity: 0; }
        }
        .animate-diagonal-fly {
          animation: diagonalFly 2s ease-in forwards;
        }
      `}</style>

      {/* ── 지도 배경 ────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <GpsTrackingMap
          geoJson={pageState === "idle" ? idleGps.geoJson : geoJson}
          currentPos={pageState === "idle" ? idleGps.currentPos : currentPos}
          onTrailLoaded={() => setTrailLoaded(true)}
          onMapReady={(map) => {
            mapRef.current = map;
          }} // [orda/feat/trail-difficulty] map 인스턴스 저장
        />
      </div>

      {/* ── 등산로 로딩 오버레이 ─────────────────── */}
      {!trailLoaded && (
        <div className="absolute inset-x-0 top-20 z-10 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-md backdrop-blur-sm">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#89943d] border-t-transparent" />
            <span className="text-xs font-medium text-slate-600">
              등산로 불러오는 중...
            </span>
          </div>
        </div>
      )}

      {/* ── 공통 헤더 ────────────────────────────── */}
      {/* [orda/feat/trail-difficulty] 로고만 표시하는 심플 헤더로 변경 */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* ── hiking 중 정보 패널 ───────────────────── */}
      {(pageState === "hiking" || pageState === "finished") && (
        <div className="relative z-10 mx-4 mt-4 rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
          <div className="mb-4 flex flex-col items-center">
            <span className="mb-1 text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
              Time
            </span>
            <span className="text-4xl font-bold tracking-tighter text-slate-900 tabular-nums">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-4">
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
                currentAltitude != null ? currentAltitude.toLocaleString() : "—"
              }
              unit={currentAltitude != null ? "m" : ""}
            />
          </div>

          <div className="mt-4 space-y-2">
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
              className={`mt-3 rounded-xl px-4 py-3 text-sm font-medium ${
                summitResult.verified
                  ? "bg-green-50 text-green-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}>
              {summitResult.verified
                ? `🏔 ${summitResult.summitName ?? "정상"} 인증 완료`
                : `📍 정상까지 약 ${summitResult.distanceM ?? "—"}m 남음`}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="relative z-10 mx-4 mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ── 난이도 범례 ──────────────────────────── */}
      {/* [orda/feat/trail-difficulty] 난이도 색상 범례 추가 */}
      {trailLoaded && (
        <div className="absolute bottom-[190px] left-4 z-10 rounded-xl bg-white/90 px-3 py-2 shadow-md backdrop-blur-sm">
          <p className="mb-1.5 text-[10px] font-bold text-slate-500 uppercase">
            난이도
          </p>
          {[
            { label: "쉬움", color: "#22c55e" },
            { label: "보통", color: "#84cc16" },
            { label: "어려움", color: "#eab308" },
            { label: "매우 어려움", color: "#f97316" },
            { label: "최상급", color: "#ef4444" }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 py-0.5">
              <div
                className="h-2 w-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-slate-600">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── 내 위치로 돌아오기 버튼 ─────────────── */}
      {/* [orda/feat/trail-difficulty] 추가 */}
      <button
        onClick={handleMoveToCurrentPos}
        className="absolute right-4 bottom-[190px] z-20 flex flex-col items-center justify-center gap-0.5 rounded-xl bg-white px-2 py-2 shadow-md active:scale-95">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#89943d" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3" fill="#89943d" />
          <line
            x1="12"
            y1="2"
            x2="12"
            y2="6"
            stroke="#89943d"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="12"
            y1="18"
            x2="12"
            y2="22"
            stroke="#89943d"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="2"
            y1="12"
            x2="6"
            y2="12"
            stroke="#89943d"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="18"
            y1="12"
            x2="22"
            y2="12"
            stroke="#89943d"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-[9px] font-medium text-slate-500">현위치</span>
      </button>

      {/* ── 플로팅 버튼 영역 ─────────────────────── */}
      <div className="absolute right-0 bottom-[100px] left-0 z-10 px-6">
        {pageState === "idle" && (
          <div className="relative flex flex-col items-center gap-2">
            {/* [orda/feat/trail-difficulty] 배낭맨 아이콘 - 클릭 시 우상단 대각선으로 날아가며 사라짐 */}
            <img
              src={hikingIcon}
              alt="hiking"
              className={`h-10 w-10 ${isAnimating ? "animate-diagonal-fly" : ""}`}
            />
            <button
              onClick={handleStartWithAnimation}
              disabled={isLoading || isAnimating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#89943d] py-4 font-bold text-white shadow-lg shadow-[#89943d]/30 transition-all active:scale-95 disabled:opacity-60">
              <span className="material-symbols-outlined text-3xl">hiking</span>
              <span className="text-xs tracking-widest uppercase">
                {isLoading ? "연결 중..." : "등산 시작"}
              </span>
            </button>
          </div>
        )}

        {pageState === "hiking" && (
          <div className="flex gap-3">
            <button
              onClick={handleVerify}
              disabled={isVerifying || !currentPos}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-4 font-bold text-slate-900 shadow-md transition-all active:scale-95 disabled:opacity-40">
              <span className="material-symbols-outlined text-xl">
                {isVerifying ? "autorenew" : "landscape"}
              </span>
              <span className="text-xs tracking-widest uppercase">
                {isVerifying ? "인증 중..." : "정상 인증"}
              </span>
            </button>
            <button
              onClick={() => setShowFinishConfirm(true)}
              className="flex flex-[1.5] items-center justify-center gap-2 rounded-xl bg-[#89943d] py-4 font-bold text-white shadow-lg shadow-[#89943d]/30 transition-all active:scale-95">
              <span className="material-symbols-outlined text-xl">stop</span>
              <span className="text-xs tracking-widest uppercase">Finish</span>
            </button>
          </div>
        )}

        {pageState === "finished" && (
          <button
            onClick={() => {
              setPageState("idle");
              setSummitResult(null);
            }}
            className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white transition-all active:scale-95">
            홈으로
          </button>
        )}
      </div>

      {/* ── BottomNav ────────────────────────────── */}
      <BottomNav />

      {/* ── 종료 확인 바텀시트 ───────────────────── */}
      {showFinishConfirm && (
        <div
          className="absolute inset-0 z-20 flex items-end bg-black/50"
          onClick={() => setShowFinishConfirm(false)}>
          <div
            className="w-full rounded-t-3xl bg-white px-6 pt-5 pb-10"
            onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
            <h2 className="mb-1 text-center text-xl font-bold text-slate-900">
              등산을 종료할까요?
            </h2>
            <p className="mb-6 text-center text-sm text-slate-400">
              {formatTime(elapsedSeconds)} 동안 {distanceKm.toFixed(2)}km 이동
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 rounded-2xl border border-slate-200 py-4 text-sm font-medium text-slate-500">
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
