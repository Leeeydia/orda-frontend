import { formatDistanceKm, formatDuration, formatMeters } from "@/utils/format";
import type {
  ElevationSummaryStatus,
  ReplaySessionModel
} from "../types/hiking.types";

function formatDistanceDisplay(distanceMeters: number | null | undefined) {
  if (distanceMeters == null || Number.isNaN(distanceMeters)) {
    return "-";
  }

  if (distanceMeters >= 1000) {
    return formatDistanceKm(distanceMeters, 2);
  }

  return formatMeters(distanceMeters, 0);
}

function formatDurationDisplay(totalElapsedSeconds: number | null | undefined) {
  if (totalElapsedSeconds == null || Number.isNaN(totalElapsedSeconds)) {
    return "-";
  }

  return formatDuration(totalElapsedSeconds);
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

function formatElevationDisplay(
  value: number | null | undefined,
  status: ElevationSummaryStatus | undefined
) {
  if (value == null || Number.isNaN(value)) {
    return status === "UNAVAILABLE" ? "계산 불가" : "-";
  }

  return formatMeters(value, 0);
}

function getSummaryMessage(
  status: ElevationSummaryStatus | undefined
): string | null {
  if (status === "ESTIMATED") {
    return "일부 짧은 구간은 보간된 고도 데이터를 사용했습니다.";
  }

  if (status === "UNAVAILABLE") {
    return "일부 구간의 고도 데이터가 부족해 상승 고도를 계산하지 못했습니다.";
  }

  return null;
}

type ReplaySummarySectionProps = {
  replay: ReplaySessionModel;
};

export default function ReplaySummarySection({
  replay
}: ReplaySummarySectionProps) {
  const { summary } = replay;
  const pace = formatPace(
    summary.totalDistanceMeters,
    summary.totalElapsedSeconds
  );
  const summaryMessage = getSummaryMessage(summary.elevationSummaryStatus);

  return (
    <div className="space-y-4 px-4 pt-4">
      <section className="rounded-3xl border border-[#89943d]/10 bg-white px-4 py-4 shadow-sm">
        <div className="mb-3">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#89943d] uppercase">
            기록 요약
          </p>
        </div>

        {summaryMessage && (
          <div
            className={`mb-3 rounded-2xl px-3 py-2 text-xs font-medium ${
              summary.elevationSummaryStatus === "UNAVAILABLE"
                ? "border border-amber-200 bg-amber-50 text-amber-700"
                : "border border-[#89943d]/10 bg-[#f7f7f6] text-slate-600"
            }`}
          >
            {summaryMessage}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#f7f7f6] px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#89943d] uppercase">
              거리
            </p>
            <p className="mt-1 text-base font-bold text-[#2f3415]">
              {formatDistanceDisplay(summary.totalDistanceMeters)}
            </p>
          </div>

          <div className="rounded-2xl bg-[#f7f7f6] px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#89943d] uppercase">
              시간
            </p>
            <p className="mt-1 text-base font-bold text-[#2f3415]">
              {formatDurationDisplay(summary.totalElapsedSeconds)}
            </p>
          </div>

          <div className="rounded-2xl bg-[#f7f7f6] px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#89943d] uppercase">
              상승
            </p>
            <p className="mt-1 text-base font-bold text-[#2f3415]">
              {formatElevationDisplay(
                summary.totalElevationGainMeters,
                summary.elevationSummaryStatus
              )}
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