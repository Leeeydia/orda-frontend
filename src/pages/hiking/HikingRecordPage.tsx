/**
 * 📄 src/pages/hiking/HikingRecordPage.tsx
 *
 * 변경 사항:
 *  - idle 상태에서 내 위치 표시, 현위치 버튼, 헤더 심플화, 난이도 범례 추가
 *  - 페이지 진입 시 단발성 위치 조회 (현위치 버튼용)
 *  - BottomNav 추가
 *  - 등산 중 TIME/거리/고도 카드, 정상 인증, 종료 기능 추가
 *  - 배낭맨 하단 대기 → 마커로 이동 애니메이션 추가
 *  - 100대 명산 모드 토글, 마커 표시, 바텀시트 연결
 *  - 명산 마커 탭 시 해당 산 위치로 지도 이동 및 반경 등산로 표시
 *  - 100대 명산 모드 토글 버튼 나침반 아래 배치, 텍스트 전환
 *  - 명산 마커 탭 시 edgeIds 기반 등산로 조회로 교체, edgeIds 없으면 반경 5km fallback
 *  - 등산로 로딩 상태 관리 추가, 데이터 없을 시 바텀시트에 준비 중 문구 표시
 */
import { useState, useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import { useHiking } from "@/features/hiking/hooks/useHiking";
import GpsTrackingMap from "@/features/gps/components/GpsTrackingMap";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Button from "@/components/ui/Button";
import type { GpsPoint } from "@/features/gps/types/gps.types";
import { getTop100Mountains } from "@/features/mountain/api/mountainApi";
import { getTrailDifficultyMapByEdgeIds } from "@/features/trail/api/trailApi";
import type { Top100Mountain } from "@/features/mountain/types/mountainTypes";
import type { TrailGeoJson } from "@/features/trail/types/trail.types";
import Top100MountainBottomSheet from "@/features/mountain/components/Top100MountainBottomSheet";

import hikerIcon from "@/assets/hiking-icon.png";

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "쉬움",
  moderate: "보통",
  hard: "어려움",
  very_hard: "매우 어려움",
  extreme: "최상급"
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#22c55e",
  moderate: "#84cc16",
  hard: "#eab308",
  very_hard: "#f97316",
  extreme: "#ef4444"
};

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
  const w = 100,
    h = 80;
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

export default function HikingRecordPage() {
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

  const mapRef = useRef<maplibregl.Map | null>(null);
  const hikerRef = useRef<HTMLImageElement | null>(null);

  const [pageState, setPageState] = useState<PageState>("idle");
  const [trailLoaded, setTrailLoaded] = useState(false);
  const [hikerAnimating, setHikerAnimating] = useState(false);
  const [hikerStyle, setHikerStyle] = useState<React.CSSProperties>({});
  const [summitResult, setSummitResult] = useState<{
    verified: boolean;
    summitName?: string;
    distanceM?: number;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const [idlePos, setIdlePos] = useState<{ lng: number; lat: number } | null>(
    null
  );
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setIdlePos({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // 100대 명산 모드 상태
  const [isMountainMode, setIsMountainMode] = useState(false);
  const [mountains, setMountains] = useState<Top100Mountain[]>([]);
  const [selectedMountain, setSelectedMountain] =
    useState<Top100Mountain | null>(null);
  const [isMountainLoading, setIsMountainLoading] = useState(false);
  const [mountainTrailGeoJson, setMountainTrailGeoJson] =
    useState<TrailGeoJson | null>(null);
  const [isMountainTrailLoading, setIsMountainTrailLoading] = useState(false);

  // 100대 명산 모드 토글
  const handleMountainModeToggle = async () => {
    if (isMountainMode) {
      setIsMountainMode(false);
      setMountains([]);
      setSelectedMountain(null);
      setMountainTrailGeoJson(null);
      return;
    }
    setIsMountainLoading(true);
    try {
      const data = await getTop100Mountains();
      setMountains(data);
      setIsMountainMode(true);
    } finally {
      setIsMountainLoading(false);
    }
  };

  // 명산 마커 탭 → 지도 이동 + edgeIds 기반 등산로 조회 (없으면 반경 5km fallback)
  const handleMountainClick = async (mountain: Top100Mountain) => {
    setSelectedMountain(mountain);
    setMountainTrailGeoJson(null);
    setIsMountainTrailLoading(true);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [mountain.longitude, mountain.latitude],
        zoom: 13,
        duration: 800
      });
    }
    try {
      if (mountain.edgeIds && mountain.edgeIds.length > 0) {
        const trailData = await getTrailDifficultyMapByEdgeIds(
          mountain.edgeIds
        );
        setMountainTrailGeoJson(trailData);
      }
    } catch (e) {
      console.error("mountain trail load error", e);
    } finally {
      setIsMountainTrailLoading(false);
    }
  };

  const elapsedSeconds = useElapsedTime(pageState === "hiking");

  const handleStart = async () => {
    const pos = currentPos ?? idlePos;

    if (hikerRef.current && mapRef.current && pos) {
      const markerPixel = mapRef.current.project([pos.lng, pos.lat]);
      const hikerRect = hikerRef.current.getBoundingClientRect();
      const hikerCenterX = hikerRect.left + hikerRect.width / 2;
      const hikerCenterY = hikerRect.top + hikerRect.height / 2;

      const mapContainer = mapRef.current.getContainer();
      const mapRect = mapContainer.getBoundingClientRect();

      const targetX = mapRect.left + markerPixel.x;
      const targetY = mapRect.top + markerPixel.y;

      const dx = targetX - hikerCenterX;
      const dy = targetY - hikerCenterY;

      setHikerAnimating(true);
      setHikerStyle({
        transform: `translate(${dx}px, ${dy}px)`,
        transition: "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: 1
      });

      setTimeout(async () => {
        const success = await start();
        setHikerAnimating(false);
        setHikerStyle({});
        if (success) setPageState("hiking");
      }, 1200);
    } else {
      const success = await start();
      if (success) setPageState("hiking");
    }
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

  const handleMoveToCurrentPos = () => {
    const pos = currentPos ?? idlePos;
    if (mapRef.current && pos) {
      mapRef.current.flyTo({
        center: [pos.lng, pos.lat],
        zoom: 15,
        duration: 800
      });
    }
  };

  return (
    <div
      className="relative flex flex-col"
      style={{
        height: "100dvh",
        maxWidth: 390,
        margin: "0 auto",
        background: "#f7f7f6"
      }}>
      <Header title="등산 지도" />

      <div className="relative flex-1 overflow-hidden">
        <GpsTrackingMap
          geoJson={geoJson}
          currentPos={
            currentPos ??
            (idlePos
              ? { ...idlePos, altitude: null, accuracy: 0, timestamp: 0 }
              : null)
          }
          isTracking={pageState === "hiking"}
          hikerIconUrl={hikerIcon}
          onTrailLoaded={() => setTrailLoaded(true)}
          onMapReady={(map) => {
            mapRef.current = map;
          }}
          mountains={isMountainMode ? mountains : []}
          onMountainClick={handleMountainClick}
          mountainTrailGeoJson={mountainTrailGeoJson}
        />

        {/* 현위치 버튼 + 100대 명산 토글 버튼 */}
        {pageState === "idle" && !selectedMountain && (
          <div
            style={{
              position: "absolute",
              bottom: 180,
              right: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              zIndex: 50
            }}>
            {/* 현위치 버튼 */}
            <button
              onClick={handleMoveToCurrentPos}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "white",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                gap: 2
              }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#89943d"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="2" x2="12" y2="5" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="2" y1="12" x2="5" y2="12" />
                <line x1="19" y1="12" x2="22" y2="12" />
              </svg>
              <span style={{ fontSize: 9, color: "#89943d", fontWeight: 600 }}>
                현위치
              </span>
            </button>

            {/* 100대 명산 토글 버튼 */}
            <button
              onClick={handleMountainModeToggle}
              disabled={isMountainLoading}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: isMountainMode ? "#89943d" : "white",
                border: `1px solid ${isMountainMode ? "#89943d" : "#e2e8f0"}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                gap: 2,
                opacity: isMountainLoading ? 0.6 : 1
              }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>🏔</span>
              <span
                style={{
                  fontSize: 8,
                  color: isMountainMode ? "white" : "#89943d",
                  fontWeight: 700,
                  lineHeight: 1
                }}>
                {isMountainLoading ? "..." : isMountainMode ? "일반" : "명산"}
              </span>
            </button>
          </div>
        )}

        {/* 난이도 범례 */}
        {trailLoaded && pageState === "idle" && (
          <div
            style={{
              position: "absolute",
              bottom: 180,
              left: 16,
              background: "white",
              borderRadius: 10,
              padding: "6px 8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              zIndex: 20,
              fontSize: 10
            }}>
            <div style={{ fontWeight: 600, marginBottom: 2, color: "#374151" }}>
              난이도
            </div>
            {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginBottom: 1
                }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: DIFFICULTY_COLORS[key]
                  }}
                />
                <span style={{ color: "#6b7280" }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* 등산 중 통계 카드 */}
        {(pageState === "hiking" || pageState === "finished") && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "white",
              borderRadius: "24px 24px 0 0",
              padding: "12px 24px 24px",
              zIndex: 20,
              boxShadow: "0 -4px 20px rgba(0,0,0,0.1)"
            }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 16
              }}>
              <div
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  background: "#e2e8f0"
                }}
              />
            </div>

            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#94a3b8",
                  letterSpacing: "0.2em",
                  marginBottom: 4
                }}>
                TIME
              </div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: "#0f172a",
                  fontVariantNumeric: "tabular-nums"
                }}>
                {formatTime(elapsedSeconds)}
              </div>
            </div>

            <div
              className="grid grid-cols-3 gap-4"
              style={{
                borderTop: "1px solid #f1f5f9",
                borderBottom: "1px solid #f1f5f9",
                padding: "16px 0",
                marginBottom: 16
              }}>
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

            <ElevationChart trail={trail ?? []} />

            {summitResult && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 16px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 500,
                  background: summitResult.verified ? "#f0fdf4" : "#fefce8",
                  color: summitResult.verified ? "#15803d" : "#a16207"
                }}>
                {summitResult.verified
                  ? `🏔 ${summitResult.summitName ?? "정상"} 인증 완료`
                  : `📍 정상까지 약 ${summitResult.distanceM ?? "—"}m 남음`}
              </div>
            )}

            {error && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 16px",
                  borderRadius: 12,
                  fontSize: 14,
                  background: "#fef2f2",
                  color: "#dc2626"
                }}>
                {error}
              </div>
            )}

            {pageState === "hiking" && (
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button
                  onClick={handleVerify}
                  disabled={isVerifying || !currentPos}
                  style={{
                    flex: 1,
                    padding: "16px 0",
                    borderRadius: 16,
                    background: "#f1f5f9",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#0f172a",
                    opacity: isVerifying || !currentPos ? 0.4 : 1
                  }}>
                  {isVerifying ? "인증 중..." : "정상 인증"}
                </button>
                <button
                  onClick={() => setShowFinishConfirm(true)}
                  style={{
                    flex: 1.5,
                    padding: "16px 0",
                    borderRadius: 16,
                    background: "#89943d",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "white"
                  }}>
                  stop FINISH
                </button>
              </div>
            )}

            {pageState === "finished" && (
              <Button
                variant="primary"
                onClick={() => {
                  setPageState("idle");
                  setSummitResult(null);
                }}>
                홈으로
              </Button>
            )}
          </div>
        )}

        {/* 100대 명산 바텀시트 */}
        {selectedMountain && (
          <Top100MountainBottomSheet
            mountain={selectedMountain}
            onClose={() => setSelectedMountain(null)}
            isTrailLoading={isMountainTrailLoading}
            hasTrailData={
              !!mountainTrailGeoJson && mountainTrailGeoJson.features.length > 0
            }
          />
        )}
      </div>

      {/* 배낭맨 + 등산 시작 버튼 */}
      {pageState === "idle" && (
        <div
          style={{
            position: "absolute",
            bottom: 83,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingBottom: 24,
            zIndex: 30
          }}>
          <img
            ref={hikerRef}
            src={hikerIcon}
            alt="hiker"
            style={{
              width: 42,
              height: 42,
              marginBottom: 8,
              transition: hikerAnimating ? undefined : "none",
              ...hikerStyle
            }}
          />
          <button
            onClick={handleStart}
            disabled={hikerAnimating || isLoading}
            style={{
              width: "calc(100% - 32px)",
              padding: "16px 0",
              borderRadius: 16,
              background: "#89943d",
              color: "white",
              fontWeight: 700,
              fontSize: 18,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(137,148,61,0.3)",
              opacity: hikerAnimating || isLoading ? 0.6 : 1
            }}>
            <span style={{ fontStyle: "italic", marginRight: 6 }}>hiking</span>
            {isLoading ? "연결 중..." : "등산 시작"}
          </button>
        </div>
      )}

      {/* BottomNav */}
      {pageState === "idle" && <BottomNav />}

      {/* 종료 확인 바텀시트 */}
      {showFinishConfirm && (
        <div
          className="absolute inset-0 z-20 flex items-end bg-black/50"
          onClick={() => setShowFinishConfirm(false)}>
          <div
            className="w-full rounded-t-3xl bg-white px-6 pt-5 pb-10"
            onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                background: "#e2e8f0",
                margin: "0 auto 16px"
              }}
            />
            <h2 className="mb-1 text-center text-xl font-bold text-slate-900">
              등산을 종료할까요?
            </h2>
            <p className="mb-6 text-center text-sm text-slate-400">
              {formatTime(elapsedSeconds)} 동안 {distanceKm.toFixed(2)}km 이동
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowFinishConfirm(false)}>
                계속하기
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleEnd}
                isLoading={isLoading}
                disabled={isLoading}>
                기록 저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
