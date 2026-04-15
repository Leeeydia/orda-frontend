import { useState, useRef } from "react";
import type { Top100Mountain } from "../types/mountainTypes";

const parseDifficulty = (raw: string) => {
  const timeMatch = raw.match(/산행시간\s*:\s*([^산]+)/);
  const heightMatch = raw.match(/산높이\s*:\s*([^난]+)/);
  const levelMatch = raw.match(/난이도\s*:\s*(.+)/);
  return {
    time: timeMatch?.[1]?.trim() ?? "-",
    height: heightMatch?.[1]?.trim() ?? "-",
    level: levelMatch?.[1]?.trim() ?? "-"
  };
};

interface Props {
  mountain: Top100Mountain;
  onClose: () => void;
  isTrailLoading: boolean;
  hasTrailData: boolean;
}

export default function Top100MountainBottomSheet({
  mountain,
  onClose,
  isTrailLoading,
  hasTrailData
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const dragStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const diff = dragStartY.current - e.touches[0].clientY;
    if (diff > 30) {
      setExpanded(true);
      dragStartY.current = null;
    } else if (diff < -30) {
      setExpanded(false);
      dragStartY.current = null;
    }
  };

  const handleTouchEnd = () => {
    dragStartY.current = null;
  };

  const parsed = parseDifficulty(mountain.difficulty);

  return (
    <div
      className="absolute inset-0 z-40 flex items-end"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}>
      <div
        className="w-full rounded-t-2xl bg-white"
        style={{
          height: expanded ? "80dvh" : "33dvh",
          display: "flex",
          flexDirection: "column",
          transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
        onClick={(e) => e.stopPropagation()}>
        {/* 핸들 영역 */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            flexShrink: 0,
            padding: "16px 16px 12px",
            cursor: "grab",
            touchAction: "none"
          }}>
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: "#e2e8f0",
              margin: "0 auto 12px"
            }}
          />
          <h2 className="text-lg font-bold text-[#4A521E]">{mountain.name}</h2>
          <p className="mt-0.5 text-xs text-[#7A8070]">{mountain.location}</p>
        </div>

        {/* 스크롤 영역 */}
        <div style={{ overflowY: "auto", padding: "0 16px 24px" }}>
          {/* 고도 / 난이도 */}
          <div className="mb-3 flex gap-2">
            <div className="flex-1 rounded-xl border border-[#D7DACB] bg-[#F4F5EF] p-3">
              <p className="mb-1 text-xs font-bold text-[#7A8070]">고도</p>
              <p className="text-base font-bold text-[#4A521E]">
                {Number(mountain.height).toLocaleString()}
                <span className="ml-1 text-xs font-medium text-[#7A8070]">
                  m
                </span>
              </p>
            </div>
            <div className="flex-1 rounded-xl border border-[#D7DACB] bg-[#F4F5EF] p-3">
              <p className="mb-1 text-xs font-bold text-[#7A8070]">
                난이도 정보
              </p>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs text-[#3D3D2E]">
                  <span className="font-bold">산행시간</span> {parsed.time}
                </p>
                <p className="text-xs text-[#3D3D2E]">
                  <span className="font-bold">산높이</span> {parsed.height}
                </p>
                <p className="text-xs text-[#3D3D2E]">
                  <span className="font-bold">난이도</span> {parsed.level}
                </p>
              </div>
            </div>
          </div>

          {/* 특징 */}
          <div className="rounded-xl border border-[#D7DACB] bg-[#F4F5EF] p-3">
            <p className="mb-2 text-xs font-bold text-[#7A8070]">특징</p>
            {mountain.feature
              .split(". ")
              .filter(Boolean)
              .map((sentence, i) => (
                <p
                  key={i}
                  className="mb-1.5 text-xs leading-relaxed text-[#3D3D2E] last:mb-0">
                  {sentence.endsWith(".") ? sentence : `${sentence}.`}
                </p>
              ))}
          </div>

          {/* 등산로 데이터 상태 */}
          {!isTrailLoading && !hasTrailData && (
            <div
              className="mt-3 rounded-xl border border-[#D7DACB] bg-[#F4F5EF] p-3"
              style={{ textAlign: "center" }}>
              <p className="text-xs text-[#7A8070]">
                🚧 등산로 데이터를 준비 중입니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
