import { formatDistanceKm } from "@/utils/format";
import {
  isRenderableElevationPoint,
  mapElevationPointsToSvgPath
} from "../mappers/hikingMappers";
import type {
  ElevationProfileResponse,
  ElevationSummaryStatus
} from "../types/hiking.types";

type Props = {
  elevationProfile: ElevationProfileResponse | null;
};

const getSummaryMessage = (
  status: ElevationSummaryStatus | undefined
): string | null => {
  if (status === "ESTIMATED") {
    return "일부 짧은 구간은 보간된 고도 데이터를 사용했습니다.";
  }

  if (status === "UNAVAILABLE") {
    return "확인 가능한 구간만 그래프로 표시합니다.";
  }

  return null;
};

export default function ElevationProfileCard({ elevationProfile }: Props) {
  const points = elevationProfile?.points ?? [];
  const summary = elevationProfile?.summary ?? null;
  const summaryStatus = summary?.elevationSummaryStatus;
  const path = mapElevationPointsToSvgPath(points);

  const maxElevation = summary?.maxElevationMeters ?? null;
  const totalDistanceMeters = summary?.totalDistanceMeters ?? null;

  const hasRenderablePoints = points.some(isRenderableElevationPoint);
  const hasPath = path.trim().length > 0;

  const isContinuousProfile =
    points.length > 0 && points.every(isRenderableElevationPoint);

  const summaryMessage = getSummaryMessage(summaryStatus);

  const xAxisLabels =
    totalDistanceMeters != null
      ? [
          formatDistanceKm(0),
          formatDistanceKm(totalDistanceMeters / 3),
          formatDistanceKm((totalDistanceMeters * 2) / 3),
          formatDistanceKm(totalDistanceMeters)
        ]
      : ["0km", "", "", ""];

  return (
    <section className="overflow-hidden rounded-3xl border border-[#89943d]/10 bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.04em] text-[#89943d]">
            고도 프로파일
          </p>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-[#2f3415]">
            고도 변화
          </h2>
        </div>

        {maxElevation != null && (
          <span className="rounded-full bg-[#89943d]/10 px-3 py-1 text-[11px] font-semibold text-[#4a521e]">
            최고 {Math.round(maxElevation)}m
          </span>
        )}
      </div>

      <div className="px-5 pb-5">
        <div className="rounded-3xl border border-[#89943d]/10 bg-[#f7f7f6] px-4 py-4">
          {summaryMessage && (
            <div
              className={`mb-3 rounded-2xl px-3 py-2 text-xs font-medium ${
                summaryStatus === "UNAVAILABLE"
                  ? "border border-amber-200 bg-amber-50 text-amber-700"
                  : "border border-[#89943d]/10 bg-white text-slate-600"
              }`}
            >
              {summaryMessage}
            </div>
          )}

          <div className="mt-2 rounded-2xl bg-white px-3 py-3">
            {!points.length || !hasRenderablePoints || !hasPath ? (
              <div className="flex h-28 items-center justify-center text-xs text-slate-400">
                표시할 고도 데이터가 없습니다
              </div>
            ) : (
              <>
                <div className="h-28">
                  <svg
                    viewBox="0 0 320 120"
                    className="h-full w-full"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="elevationGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#89943d"
                          stopOpacity="0.28"
                        />
                        <stop
                          offset="100%"
                          stopColor="#89943d"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    {isContinuousProfile && (
                      <path
                        d={`${path} L 320 120 L 0 120 Z`}
                        fill="url(#elevationGradient)"
                      />
                    )}

                    <path
                      d={path}
                      fill="none"
                      stroke="#89943d"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="mt-2 flex items-center justify-between px-1">
                  {xAxisLabels.map((label, index) => (
                    <span
                      key={`${label}-${index}`}
                      className="text-[10px] font-semibold text-[#89943d]/70"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}