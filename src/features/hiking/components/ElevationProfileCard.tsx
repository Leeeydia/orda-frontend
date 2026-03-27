import { mapElevationPointsToSvgPath } from "../mappers/hikingMappers";
import type { ElevationProfileResponse } from "../types/hiking.types";

type Props = {
  elevationProfile: ElevationProfileResponse | null;
};

export default function ElevationProfileCard({
  elevationProfile
}: Props) {
  const points = elevationProfile?.points ?? [];

  const path = mapElevationPointsToSvgPath(points);

  const maxElevation = elevationProfile?.summary.maxElevationMeters;

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
          <div className="mt-2 h-28 rounded-2xl bg-white px-3 py-3">
            {points.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                고도 데이터 없음
              </div>
            ) : (
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

                {/* 면 영역 */}
                <path
                  d={`${path} L 320 120 L 0 120 Z`}
                  fill="url(#elevationGradient)"
                />

                {/* 선 */}
                <path
                  d={path}
                  fill="none"
                  stroke="#89943d"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}