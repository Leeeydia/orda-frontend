import type {
  ElevationSummaryStatus,
  ReplaySessionModel
} from "../types/hiking.types";
import {
  formatDistanceDisplay,
  formatDurationDisplay,
  formatElevationDisplay
} from "../mappers/hikingMappers";
import SummaryNotice from "./SummaryNotice";

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

const ReplaySummarySection = ({ replay }: ReplaySummarySectionProps) => {
  const { summary } = replay;
  const pace = formatPace(
    summary.totalDistanceMeters,
    summary.totalElapsedSeconds
  );
  const summaryMessage = getSummaryMessage(summary.elevationSummaryStatus);

  return (
    <section className="border-primary/10 rounded-3xl border bg-white px-4 py-4 shadow-sm">
      <div className="mb-3">
        <p className="text-primary text-[11px] font-semibold tracking-[0.16em] uppercase">
          기록 요약
        </p>
      </div>

      {summaryMessage ? (
        <SummaryNotice
          message={summaryMessage}
          tone={
            summary.elevationSummaryStatus === "UNAVAILABLE"
              ? "warning"
              : "default"
          }
          surface="soft"
          className="mb-3"
        />
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-bg-page rounded-2xl px-4 py-3">
          <p className="text-primary text-[11px] font-semibold tracking-[0.14em] uppercase">
            거리
          </p>
          <p className="text-heading mt-1 text-base font-bold">
            {formatDistanceDisplay(summary.totalDistanceMeters)}
          </p>
        </div>

        <div className="bg-bg-page rounded-2xl px-4 py-3">
          <p className="text-primary text-[11px] font-semibold tracking-[0.14em] uppercase">
            시간
          </p>
          <p className="text-heading mt-1 text-base font-bold">
            {formatDurationDisplay(summary.totalElapsedSeconds)}
          </p>
        </div>

        <div className="bg-bg-page rounded-2xl px-4 py-3">
          <p className="text-primary text-[11px] font-semibold tracking-[0.14em] uppercase">
            상승
          </p>
          <p className="text-heading mt-1 text-base font-bold">
            {formatElevationDisplay(
              summary.totalElevationGainMeters,
              summary.elevationSummaryStatus
            )}
          </p>
        </div>

        <div className="bg-bg-page rounded-2xl px-4 py-3">
          <p className="text-primary text-[11px] font-semibold tracking-[0.14em] uppercase">
            페이스
          </p>
          <p className="text-heading mt-1 text-base font-bold">
            {pace}
            {pace !== "-" ? (
              <span className="text-body/60 ml-1 text-xs font-medium">/km</span>
            ) : null}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ReplaySummarySection;