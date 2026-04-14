import type { Top100Mountain } from "../types/mountainTypes";

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

interface Props {
  mountain: Top100Mountain;
  onClose: () => void;
}

export default function Top100MountainBottomSheet({
  mountain,
  onClose
}: Props) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-end"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}>
      <div
        className="w-full rounded-t-2xl bg-white px-4 pt-5 pb-10"
        onClick={(e) => e.stopPropagation()}>
        {/* 핸들 */}
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: "#e2e8f0",
            margin: "0 auto 20px"
          }}
        />

        {/* 이름 + 고도 */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#4A521E]">{mountain.name}</h2>
          <p className="mt-1 text-sm text-[#7A8070]">{mountain.location}</p>
        </div>

        {/* 고도 / 난이도 */}
        <div className="mb-4 flex gap-3">
          <div className="flex-1 rounded-xl border border-[#D7DACB] bg-[#F4F5EF] p-4">
            <p className="mb-1 text-xs font-bold text-[#7A8070]">고도</p>
            <p className="text-lg font-bold text-[#4A521E]">
              {mountain.height.toLocaleString()}
              <span className="ml-1 text-sm font-medium text-[#7A8070]">m</span>
            </p>
          </div>
          <div className="flex-1 rounded-xl border border-[#D7DACB] bg-[#F4F5EF] p-4">
            <p className="mb-1 text-xs font-bold text-[#7A8070]">난이도</p>
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: DIFFICULTY_COLORS[mountain.difficulty] ?? "#ccc",
                  flexShrink: 0
                }}
              />
              <p className="text-sm font-bold text-[#3D3D2E]">
                {DIFFICULTY_LABELS[mountain.difficulty] ?? mountain.difficulty}
              </p>
            </div>
          </div>
        </div>

        {/* 특징 */}
        <div className="rounded-xl border border-[#D7DACB] bg-[#F4F5EF] p-4">
          <p className="mb-1 text-xs font-bold text-[#7A8070]">특징</p>
          <p className="text-sm leading-relaxed text-[#3D3D2E]">
            {mountain.feature}
          </p>
        </div>
      </div>
    </div>
  );
}
