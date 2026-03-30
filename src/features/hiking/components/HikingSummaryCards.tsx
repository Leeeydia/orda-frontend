import {
  formatDistanceKm,
  formatDuration,
  formatMeters
} from "@/utils/format";
import type {
  ElevationProfileResponse,
  HikingSessionResponse
} from "../types/hiking.types";

type HikingSummaryCardsProps = {
  session: HikingSessionResponse | null;
  elevationProfile: ElevationProfileResponse | null;
};

export default function HikingSummaryCards({
  session,
  elevationProfile
}: HikingSummaryCardsProps) {
  const totalDistance =
    session?.totalDistanceM ?? elevationProfile?.summary.totalDistanceMeters ?? null;

  const totalDuration = session?.totalDurationSec ?? null;

  const totalGain =
    session?.totalElevationGainM ??
    elevationProfile?.summary.totalElevationGainMeters ??
    null;

  const totalLoss =
    session?.totalElevationLossM ??
    elevationProfile?.summary.totalElevationLossMeters ??
    null;

  const items = [
    {
      label: "거리",
      value: formatDistanceKm(totalDistance)
    },
    {
      label: "시간",
      value: formatDuration(totalDuration)
    },
    {
      label: "상승",
      value: formatMeters(totalGain)
    },
    {
      label: "하강",
      value: formatMeters(totalLoss)
    }
  ];

  return (
    <section className="overflow-hidden rounded-3xl border border-[#89943d]/10 bg-white shadow-xl shadow-[#4a521e]/10">
      <div className="border-b border-[#89943d]/8 bg-gradient-to-r from-[#89943d]/12 via-[#89943d]/6 to-transparent px-4 py-3">
        <p className="text-[11px] font-semibold tracking-[0.04em] text-[#89943d]">
          핵심 요약
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 py-4">
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
    </section>
  );
}