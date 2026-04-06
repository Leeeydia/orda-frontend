type Props = {
  svgPath: string;
  xAxisLabels: string[];
  maxElevationMeters?: number | null;
  isEmpty?: boolean;
};

const ElevationChart = ({
  svgPath,
  xAxisLabels,
  maxElevationMeters,
  isEmpty = false
}: Props) => {
  return (
    <section className="border-border-default overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-primary text-[11px] font-semibold tracking-[0.04em]">
            고도 프로파일
          </p>
          <h2 className="text-text-heading mt-1 text-lg font-bold tracking-tight">
            고도 변화
          </h2>
        </div>

        {maxElevationMeters != null && (
          <span className="bg-secondary text-text-heading rounded-full px-3 py-1 text-[11px] font-semibold">
            최고 {Math.round(maxElevationMeters)}m
          </span>
        )}
      </div>

      <div className="px-5 pb-5">
        <div className="border-border-default bg-bg-page rounded-xl border px-4 py-4">
          <div className="rounded-xl bg-white px-3 py-3">
            {isEmpty ? (
              <div className="text-text-muted flex h-28 items-center justify-center text-xs">
                고도 데이터 없음
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
                        id="elevationGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%">
                        <stop
                          offset="0%"
                          stopColor="#89943D"
                          stopOpacity="0.25"
                        />
                        <stop
                          offset="100%"
                          stopColor="#89943D"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    <path
                      d={`${svgPath} L 320 120 L 0 120 Z`}
                      fill="url(#elevationGradient)"
                    />
                    <path
                      d={svgPath}
                      fill="none"
                      stroke="#89943D"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="mt-2 flex items-center justify-between px-1">
                  {xAxisLabels.map((label, index) => (
                    <span
                      key={`${label}-${index}`}
                      className="text-text-muted text-[10px] font-semibold">
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
};

export default ElevationChart;
