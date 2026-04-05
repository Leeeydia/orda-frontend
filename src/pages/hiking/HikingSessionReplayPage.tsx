import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReplayMapSection from "@/features/hiking/components/ReplayMapSection";
import { useReplayQuery } from "@/features/hiking/hooks/useReplayQuery";
import { useReplayPlayer } from "@/features/hiking/hooks/useReplayPlayer";
import type { ReplaySessionModel } from "@/features/hiking/types/hiking.types";

type ReplayContentProps = {
  replay: ReplaySessionModel;
  onBack: () => void;
};

function ReplayPageContent({ replay, onBack }: ReplayContentProps) {
  const {
    isPlaying,
    currentReplaySeconds,
    durationSeconds,
    currentPosition,
    currentIndex,
    progress,
    play,
    pause,
    reset
  } = useReplayPlayer(replay);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#89943d]/10 bg-white/90 backdrop-blur">
        <div className="px-4 py-3">
          <div className="flex h-10 items-center justify-between rounded-2xl border border-dashed border-[#89943d]/20 bg-[#f7f7f6] px-4 text-xs font-medium text-[#89943d]/70">
            <span>Header Placeholder</span>
            <button
              type="button"
              onClick={onBack}
              className="rounded-full px-2 py-1 text-[#4a521e] transition hover:bg-[#89943d]/10">
              뒤로가기
            </button>
          </div>
        </div>
      </header>

      <main className="pb-6">
        <section className="relative px-4 pt-4">
          <div className="relative min-h-[520px] overflow-hidden rounded-[28px] border border-[#89943d]/10 bg-gradient-to-br from-[#dfe6ba] via-[#eef1dc] to-[#f7f7f6] shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(137,148,61,0.16),_transparent_55%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(255,255,255,0.18),_rgba(255,255,255,0)_28%,_rgba(0,0,0,0.08)_100%)]" />

            <ReplayMapSection
              replay={replay}
              currentPosition={currentPosition}
              currentIndex={currentIndex}
            />

            <div className="absolute top-4 right-4 left-4 z-20">
              <div className="rounded-3xl border border-white/50 bg-white/88 px-4 py-3 shadow-sm backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-[#89943d] uppercase">
                      ORDA
                    </p>
                    <h1 className="mt-1 text-base font-bold tracking-tight text-[#2f3415]">
                      세션 리플레이
                    </h1>
                    <p className="mt-1 text-xs text-slate-500">
                      저장된 GPS 트랙을 기준으로 이동 경로를 재생합니다.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#89943d]/10 px-3 py-2 text-right">
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#89943d] uppercase">
                      total points
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#2f3415]">
                      {replay.totalPoints}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute inset-x-4 bottom-4 z-20">
              <div className="rounded-3xl border border-white/50 bg-white/90 px-4 py-4 shadow-sm backdrop-blur">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-[#89943d] uppercase">
                      Replay Progress
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#2f3415]">
                      {currentReplaySeconds.toFixed(1)}s /{" "}
                      {durationSeconds.toFixed(1)}s
                    </p>
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    {(progress * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#89943d]/12">
                  <div
                    className="h-full rounded-full bg-[#89943d] transition-[width]"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-20 -mt-6 px-2">
            <div className="rounded-[28px] border border-[#89943d]/10 bg-white/92 px-4 py-4 shadow-sm backdrop-blur">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-[#89943d] uppercase">
                    Replay Controls
                  </p>
                  <h2 className="mt-1 text-sm font-bold text-[#2f3415]">
                    리플레이 제어
                  </h2>
                </div>
                <div className="rounded-full bg-[#89943d]/10 px-3 py-1 text-xs font-semibold text-[#4a521e]">
                  MVP
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={isPlaying ? pause : play}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[#89943d] text-white shadow-sm transition active:scale-95">
                  {isPlaying ? "⏸" : "▶"}
                </button>

                <button
                  type="button"
                  onClick={reset}
                  className="flex h-11 items-center justify-center rounded-2xl border border-[#89943d]/15 bg-[#f7f7f6] px-4 text-sm font-medium text-[#4a521e] transition hover:bg-[#eef1dc]">
                  처음으로
                </button>

                <div className="min-w-0 flex-1 rounded-2xl bg-[#f7f7f6] px-4 py-3">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-[#89943d] uppercase">
                    상태
                  </p>
                  <p className="mt-1 truncate text-sm text-slate-600">
                    {isPlaying ? "재생 중" : "일시정지"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-4 px-4 pt-4">
          <section className="rounded-3xl border border-[#89943d]/10 bg-white px-4 py-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[#89943d] uppercase">
                  Replay Summary
                </p>
                <h2 className="mt-1 text-sm font-bold text-[#2f3415]">
                  리플레이 요약
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f7f7f6] px-4 py-3">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#89943d] uppercase">
                  총 거리
                </p>
                <p className="mt-1 text-base font-bold text-[#2f3415]">
                  {replay.summary.totalDistanceMeters.toLocaleString()} m
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f7f6] px-4 py-3">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#89943d] uppercase">
                  총 시간
                </p>
                <p className="mt-1 text-base font-bold text-[#2f3415]">
                  {replay.summary.totalElapsedSeconds}s
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f7f6] px-4 py-3">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#89943d] uppercase">
                  상승 고도
                </p>
                <p className="mt-1 text-base font-bold text-[#2f3415]">
                  {replay.summary.totalElevationGainMeters.toLocaleString()} m
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f7f6] px-4 py-3">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#89943d] uppercase">
                  하강 고도
                </p>
                <p className="mt-1 text-base font-bold text-[#2f3415]">
                  {replay.summary.totalElevationLossMeters.toLocaleString()} m
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <div className="sticky bottom-0 border-t border-[#89943d]/10 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex h-14 items-center justify-center rounded-2xl border border-dashed border-[#89943d]/20 bg-[#f7f7f6] text-xs font-medium text-[#89943d]/70">
          Bottom Tab Placeholder
        </div>
      </div>
    </>
  );
}

export default function HikingSessionReplayPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const numericSessionId = useMemo(() => {
    if (!sessionId) return null;
    const parsed = Number(sessionId);
    return Number.isNaN(parsed) ? null : parsed;
  }, [sessionId]);

  const { replay, isLoading, isError } = useReplayQuery(numericSessionId);

  if (numericSessionId == null) {
    return (
      <div className="min-h-screen bg-[#f7f7f6] text-slate-900">
        <div className="mx-auto min-h-screen w-full max-w-md bg-[#f7f7f6]">
          <header className="sticky top-0 z-30 border-b border-[#89943d]/10 bg-white/90 backdrop-blur">
            <div className="px-4 py-3">
              <div className="flex h-10 items-center rounded-2xl border border-dashed border-[#89943d]/20 bg-[#f7f7f6] px-4 text-xs font-medium text-[#89943d]/70">
                Header Placeholder
              </div>
            </div>
          </header>

          <main className="px-4 pt-4 pb-6">
            <section className="rounded-3xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 shadow-sm">
              잘못된 세션 ID입니다.
            </section>
          </main>

          <div className="sticky bottom-0 border-t border-[#89943d]/10 bg-white/90 px-4 py-3 backdrop-blur">
            <div className="flex h-14 items-center justify-center rounded-2xl border border-dashed border-[#89943d]/20 bg-[#f7f7f6] text-xs font-medium text-[#89943d]/70">
              Bottom Tab Placeholder
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#f7f7f6] text-slate-900">
        <div className="mx-auto min-h-screen w-full max-w-md bg-[#f7f7f6]">
          <header className="sticky top-0 z-30 border-b border-[#89943d]/10 bg-white/90 backdrop-blur">
            <div className="px-4 py-3">
              <div className="flex h-10 items-center rounded-2xl border border-dashed border-[#89943d]/20 bg-[#f7f7f6] px-4 text-xs font-medium text-[#89943d]/70">
                Header Placeholder
              </div>
            </div>
          </header>

          <main className="px-4 pt-4 pb-6">
            <section className="rounded-3xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 shadow-sm">
              리플레이 정보를 불러오지 못했습니다.
            </section>
          </main>

          <div className="sticky bottom-0 border-t border-[#89943d]/10 bg-white/90 px-4 py-3 backdrop-blur">
            <div className="flex h-14 items-center justify-center rounded-2xl border border-dashed border-[#89943d]/20 bg-[#f7f7f6] text-xs font-medium text-[#89943d]/70">
              Bottom Tab Placeholder
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && replay.totalPoints === 0) {
    return (
      <div className="min-h-screen bg-[#f7f7f6] text-slate-900">
        <div className="mx-auto min-h-screen w-full max-w-md bg-[#f7f7f6]">
          <header className="sticky top-0 z-30 border-b border-[#89943d]/10 bg-white/90 backdrop-blur">
            <div className="px-4 py-3">
              <div className="flex h-10 items-center rounded-2xl border border-dashed border-[#89943d]/20 bg-[#f7f7f6] px-4 text-xs font-medium text-[#89943d]/70">
                Header Placeholder
              </div>
            </div>
          </header>

          <main className="px-4 pt-4 pb-6">
            <section className="rounded-3xl border border-[#89943d]/10 bg-white px-4 py-4 text-sm text-slate-600 shadow-sm">
              리플레이 정보를 불러오는 중...
            </section>
          </main>

          <div className="sticky bottom-0 border-t border-[#89943d]/10 bg-white/90 px-4 py-3 backdrop-blur">
            <div className="flex h-14 items-center justify-center rounded-2xl border border-dashed border-[#89943d]/20 bg-[#f7f7f6] text-xs font-medium text-[#89943d]/70">
              Bottom Tab Placeholder
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f6] text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-md bg-[#f7f7f6]">
        <ReplayPageContent
          key={numericSessionId}
          replay={replay}
          onBack={() => navigate(-1)}
        />
      </div>
    </div>
  );
}
