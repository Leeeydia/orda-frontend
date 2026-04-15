import { useId } from "react";

type ElevationChartCardVariant = "standalone" | "embedded";

type ElevationChartCardProps = {
  svgPath: string;
  xAxisLabels: string[];
  maxElevationMeters?: number | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  summaryMessage?: string | null;
  summaryTone?: "default" | "warning";
  showFilledArea?: boolean;
  variant?: ElevationChartCardVariant;
  lineStrokeWidth?: number;
  gradientTopOpacity?: number;
  xAxisLabelClassName?: string;
};

const ElevationChartCard = ({
  svgPath,
  xAxisLabels,
  maxElevationMeters,
  isEmpty = false,
  emptyMessage = "고도 데이터 없음",
  summaryMessage = null,
  summaryTone = "default",
  showFilledArea = true,
  variant = "standalone",
  lineStrokeWidth = 2.5,
  gradientTopOpacity = 0.25,
  xAxisLabelClassName = "text-muted text-xs leading-4 font-medium"
}: ElevationChartCardProps) => {
  const gradientId = `elevationGradient-${useId().replace(/:/g, "")}`;

  const summaryClassName =
    summaryTone === "warning"
      ? "border border-amber-200 bg-amber-50 text-amber-700"
      : "border border-[#89943d]/10 bg-white text-slate-600";

  if (variant === "embedded") {
    return (
      <div className="rounded-3xl border border-[#89943d]/10 bg-[#f7f7f6] px-4 py-4">
        {summaryMessage && (
          <div
            className={`mb-3 rounded-2xl px-3 py-2 text-xs font-medium ${summaryClassName}`}>
            {summaryMessage}
          </div>
        )}

        <div className="mt-2 rounded-2xl bg-white px-3 py-3">
          {isEmpty ? (
            <div className="flex h-28 items-center justify-center text-xs text-slate-400">
              {emptyMessage}
            </div>
          ) : (
            <>
              <div className="h-28">
                <svg
                  viewBox="0 0 320 120"
                  className="h-full w-full"
                  preserveAspectRatio="none">
                  <defs>
                    <linearGradient
                      id={gradientId}
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%">
                      <stop
                        offset="0%"
                        stopColor="#89943d"
                        stopOpacity={gradientTopOpacity}
                      />
                      <stop
                        offset="100%"
                        stopColor="#89943d"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  {showFilledArea && (
                    <path
                      d={`${svgPath} L 320 120 L 0 120 Z`}
                      fill={`url(#${gradientId})`}
                    />
                  )}

                  <path
                    d={svgPath}
                    fill="none"
                    stroke="#89943d"
                    strokeWidth={lineStrokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="mt-2 flex items-center justify-between px-1">
                {xAxisLabels.map((label, index) => (
                  <span
                    key={`${label}-${index}`}
                    className={xAxisLabelClassName}>
                    {label}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="border-default rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-primary text-xs leading-4 font-semibold tracking-wide">
            고도 프로파일
          </p>
          <h2 className="text-heading text-lg font-semibold">고도 변화</h2>
        </div>

        {maxElevationMeters != null ? (
          <span className="bg-secondary text-heading shrink-0 rounded-full px-3 py-1 text-xs leading-4 font-semibold">
            최고 {Math.round(maxElevationMeters)}m
          </span>
        ) : null}
      </div>

      <div className="border-default bg-bg-page mt-4 rounded-xl border p-4">
        {summaryMessage && (
          <div
            className={`mb-3 rounded-2xl px-3 py-2 text-xs font-medium ${summaryClassName}`}>
            {summaryMessage}
          </div>
        )}

        <div className="rounded-xl bg-white p-3">
          {isEmpty ? (
            <div className="text-muted flex h-28 items-center justify-center text-xs leading-4">
              {emptyMessage}
            </div>
          ) : (
            <>
              <div className="h-28">
                <svg
                  viewBox="0 0 320 120"
                  className="h-full w-full"
                  preserveAspectRatio="none">
                  <defs>
                    <linearGradient
                      id={gradientId}
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%">
                      <stop
                        offset="0%"
                        stopColor="#89943D"
                        stopOpacity={gradientTopOpacity}
                      />
                      <stop offset="100%" stopColor="#89943D" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {showFilledArea && (
                    <path
                      d={`${svgPath} L 320 120 L 0 120 Z`}
                      fill={`url(#${gradientId})`}
                    />
                  )}

                  <path
                    d={svgPath}
                    fill="none"
                    stroke="#89943D"
                    strokeWidth={lineStrokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="mt-2 flex items-center justify-between px-1">
                {xAxisLabels.map((label, index) => (
                  <span
                    key={`${label}-${index}`}
                    className={xAxisLabelClassName}>
                    {label}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ElevationChartCard;