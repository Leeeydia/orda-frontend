import { formatDistanceKm } from "@/utils/format";
import ElevationChartCard from "./ElevationChartCard";
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

  const renderablePointCount = points.filter(isRenderableElevationPoint).length;
  const hasPath = path.trim().length > 0;
  const canRenderChart = renderablePointCount >= 2 && hasPath;

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
    <section className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.04em] text-primary">
            고도 프로파일
          </p>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-heading">
            고도 변화
          </h2>
        </div>

        {maxElevation != null && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-heading">
            최고 {Math.round(maxElevation)}m
          </span>
        )}
      </div>

      <div className="px-5 pb-5">
        <ElevationChartCard
          variant="embedded"
          svgPath={path}
          xAxisLabels={xAxisLabels}
          isEmpty={!points.length || !canRenderChart}
          emptyMessage="표시할 고도 데이터가 없습니다"
          summaryMessage={summaryMessage}
          summaryTone={summaryStatus === "UNAVAILABLE" ? "warning" : "default"}
          showFilledArea={isContinuousProfile}
          lineStrokeWidth={3}
          gradientTopOpacity={0.28}
          xAxisLabelClassName="text-[10px] font-semibold text-primary/70"
        />
      </div>
    </section>
  );
}