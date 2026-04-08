/**
 * 📄 src/pages/hiking/HikingRecordPage.tsx
 *
 * 변경 사항:
 *  - [orda/feat/trail-difficulty] idle 상태에서 내 위치 표시, 현위치 버튼, 헤더 심플화, 난이도 범례 추가
 *  - [orda/feat/trail-bbox-filter] 배낭맨이 빨간 점(지도 중앙)으로 날아가며 합쳐지는 애니메이션 추가
 *  - [orda/feat/trail-bbox-filter] 페이지 진입 시 단발성 위치 조회 (현위치 버튼용)
 *  - [orda/feat/trail-difficulty] BottomNav 추가
 */
import { useState, useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import { useHiking } from "@/features/hiking/hooks/useHiking";
import GpsTrackingMap from "@/features/gps/components/GpsTrackingMap";
import HikingSessionHeader from "@/features/hiking/components/HikingSessionHeader";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

// [orda/feat/trail-difficulty] 배낭맨 아이콘 import
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

export default function HikingRecordPage() {
  const { geoJson, currentPos, isTracking, start } = useHiking();
  const mapRef = useRef<maplibregl.Map | null>(null);
  const hikerRef = useRef<HTMLImageElement | null>(null);

  const [trailLoaded, setTrailLoaded] = useState(false);
  const [hikerAnimating, setHikerAnimating] = useState(false);
  const [hikerStyle, setHikerStyle] = useState<React.CSSProperties>({});

  // [orda/feat/trail-bbox-filter] 페이지 진입 시 단발성 위치 조회 (현위치 버튼용)
  const [idlePos, setIdlePos] = useState<{ lng: number; lat: number } | null>(
    null
  );
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIdlePos({ lng: pos.coords.longitude, lat: pos.coords.latitude });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const handleStart = () => {
    if (!hikerRef.current) {
      start();
      return;
    }

    // [orda/feat/trail-bbox-filter] 배낭맨 현재 위치 계산
    const hikerRect = hikerRef.current.getBoundingClientRect();
    const hikerCenterX = hikerRect.left + hikerRect.width / 2;
    const hikerCenterY = hikerRect.top + hikerRect.height / 2;

    const targetX = window.innerWidth / 2;
    const targetY = window.innerHeight / 2;

    const dx = targetX - hikerCenterX;
    const dy = targetY - hikerCenterY;

    setHikerAnimating(true);
    setHikerStyle({
      transform: `translate(${dx}px, ${dy}px) scale(0.3)`,
      opacity: 0,
      transition: "transform 0.7s ease-in, opacity 0.7s ease-in"
    });

    setTimeout(() => {
      setHikerAnimating(false);
      setHikerStyle({});
      start();
    }, 750);
  };

  const handleMapReady = (map: maplibregl.Map) => {
    mapRef.current = map;
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
      {/* 헤더 */}
      {!isTracking ? (
        <Header title="등산 지도" />
      ) : (
        <HikingSessionHeader session={null} />
      )}

      {/* 지도 영역 */}
      <div className="relative flex-1 overflow-hidden">
        <GpsTrackingMap
          geoJson={geoJson}
          currentPos={currentPos}
          onTrailLoaded={() => setTrailLoaded(true)}
          onMapReady={handleMapReady}
        />

        {/* [orda/feat/trail-difficulty] 현위치 버튼 */}
        {!isTracking && (
          <button
            onClick={handleMoveToCurrentPos}
            style={{
              position: "absolute",
              bottom: 180,
              right: 10,
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
              zIndex: 20,
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
        )}

        {/* [orda/feat/trail-difficulty] 난이도 범례 */}
        {trailLoaded && (
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
      </div>

      {/* [orda/feat/trail-difficulty] 하단 등산 시작 버튼 + 배낭맨 */}
      {!isTracking && (
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
          {/* [orda/feat/trail-bbox-filter] 배낭맨 아이콘 - 빨간 점으로 날아가는 애니메이션 */}
          <img
            ref={hikerRef}
            src={hikerIcon}
            alt="hiker"
            style={{
              width: 56,
              height: 56,
              marginBottom: 8,
              transition: hikerAnimating ? undefined : "none",
              ...hikerStyle
            }}
          />

          {/* 등산 시작 버튼 */}
          <button
            onClick={handleStart}
            disabled={hikerAnimating}
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
              boxShadow: "0 4px 12px rgba(137,148,61,0.3)"
            }}>
            <span style={{ fontStyle: "italic", marginRight: 6 }}>hiking</span>
            등산 시작
          </button>
        </div>
      )}

      {/* [orda/feat/trail-difficulty] BottomNav */}
      {!isTracking && <BottomNav />}
    </div>
  );
}
