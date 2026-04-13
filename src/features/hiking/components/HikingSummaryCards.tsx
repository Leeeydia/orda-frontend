import {
  formatDistanceKm,
  formatDuration,
  formatMeters
} from "@/utils/format";
import type {
  ElevationProfileResponse,
  ElevationSummaryStatus,
  HikingSessionResponse
} from "../types/hiking.types";

type HikingSummaryCardsProps = {
  session: HikingSessionResponse | null;
  elevationProfile: ElevationProfileResponse | null;
};

function formatDistanceDisplay(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "-";
  }

  if (value >= 1000) {
    return formatDistanceKm(value);
  }

  return formatMeters(value, 0);
}

function formatDurationDisplay(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "-";
  }

  return formatDuration(value);
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
    return "일부 구간의 고도 데이터가 부족해 상승/하강 수치를 계산하지 못했습니다.";
  }

  return null;
}

export default function HikingSummaryCards({
  session,
  elevationProfile
}: HikingSummaryCardsProps) {
  const summary = elevationProfile?.summary ?? null;
  const elevationSummaryStatus = summary?.elevationSummaryStatus;

  const totalDistance =
    session?.totalDistanceM ?? summary?.totalDistanceMeters ?? null;
  const totalDuration = session?.totalDurationSec ?? null;
  const totalGain =
    session?.totalElevationGainM ?? summary?.totalElevationGainMeters ?? null;
  const totalLoss =
    session?.totalElevationLossM ?? summary?.totalElevationLossMeters ?? null;

  const items = [
    {
      label: "거리",
      value: formatDistanceDisplay(totalDistance)
    },
    {
      label: "시간",
      value: formatDurationDisplay(totalDuration)
    },
    {
      label: "상승",
      value: formatElevationDisplay(totalGain, elevationSummaryStatus)
    },
    {
      label: "하강",
      value: formatElevationDisplay(totalLoss, elevationSummaryStatus)
    }
  ];

  const summaryMessage = getSummaryMessage(elevationSummaryStatus);

  return (
    <section className="overflow-hidden rounded-3xl border border-[#89943d]/10 bg-white shadow-xl shadow-[#4a521e]/10">
      <div className="border-b border-[#89943d]/8 bg-gradient-to-r from-[#89943d]/12 via-[#89943d]/6 to-transparent px-4 py-3">
        <p className="text-[11px] font-semibold tracking-[0.04em] text-[#89943d]">
          핵심 요약
        </p>
      </div>

      <div className="px-4 py-4">
        {summaryMessage && (
          <div
            className={`mb-3 rounded-2xl px-3 py-2 text-xs font-medium ${
              elevationSummaryStatus === "UNAVAILABLE"
                ? "border border-amber-200 bg-amber-50 text-amber-700"
                : "border border-[#89943d]/10 bg-[#f7f7f6] text-slate-600"
            }`}
          >
            {summaryMessage}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl bg-[#f7f7f6] px-3 py-3"
            >
              <p className="text-[11px] font-semibold text-[#89943d]">
                {item.label}
              </p>
              <p className="mt-2 text-base font-bold tracking-tight text-[#2f3415]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}