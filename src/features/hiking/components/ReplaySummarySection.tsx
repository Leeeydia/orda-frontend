import type { ReplaySessionModel } from "../types/hiking.types";
import { formatDistanceKm, formatDuration, formatMeters } from "@/utils/format";

function formatDistanceDisplay(distanceMeters: number | null | undefined) {
  if (distanceMeters == null || Number.isNaN(distanceMeters)) {
    return "-";
  }

  if (distanceMeters >= 1000) {
    return formatDistanceKm(distanceMeters, 2);
  }

  return formatMeters(distanceMeters, 0);
}

function formatPace(
  distanceMeters: number | null | undefined,
  totalElapsedSeconds: number | null | undefined
) {
  if (
    distanceMeters == null ||
    totalElapsedSeconds == null ||
    Number.isNaN(distanceMeters) ||
    Number.isNaN(totalElapsedSeconds) ||
    distanceMeters <= 0 ||
    totalElapsedSeconds <= 0
  ) {
    return "-";
  }

  const paceSeconds = totalElapsedSeconds / (distanceMeters / 1000);
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = Math.floor(paceSeconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function formatElevationDisplay(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "-";
  }

  return `${Math.round(value)}m`;
}

type ReplaySummarySectionProps = {
  replay: ReplaySessionModel;
};

export default function ReplaySummarySection({
  replay
}: ReplaySummarySectionProps) {
  const pace = formatPace(
    replay.summary.totalDistanceMeters,
    replay.summary.totalElapsedSeconds
  );

  return (
    <div className="space-y-4 px-4 pt-4">
      <section className="rounded-3xl border border-[#89943d]/10 bg-white px-4 py-4 shadow-sm">
        <div className="mb-3">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#89943d] uppercase">
            기록 요약
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#f7f7f6] px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#89943d] uppercase">
              거리
            </p>
            <p className="mt-1 text-base font-bold text-[#2f3415]">
              {formatDistanceDisplay(replay.summary.totalDistanceMeters)}
            </p>
          </div>

          <div className="rounded-2xl bg-[#f7f7f6] px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#89943d] uppercase">
              시간
            </p>
            <p className="mt-1 text-base font-bold text-[#2f3415]">
              {formatDuration(replay.summary.totalElapsedSeconds)}
            </p>
          </div>

          <div className="rounded-2xl bg-[#f7f7f6] px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#89943d] uppercase">
              상승
            </p>
            <p className="mt-1 text-base font-bold text-[#2f3415]">
              {formatElevationDisplay(replay.summary.totalElevationGainMeters)}
            </p>
          </div>

          <div className="rounded-2xl bg-[#f7f7f6] px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#89943d] uppercase">
              페이스
            </p>
            <p className="mt-1 text-base font-bold text-[#2f3415]">
              {pace}
              {pace !== "-" ? (
                <span className="ml-1 text-xs font-medium text-[#424434]/60">
                  /km
                </span>
              ) : null}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
