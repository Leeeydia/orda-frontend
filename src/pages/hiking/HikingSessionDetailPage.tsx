import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ElevationProfileCard from "@/features/hiking/components/ElevationProfileCard";
import HikingSessionHeader from "@/features/hiking/components/HikingSessionHeader";
import HikingSummaryCards from "@/features/hiking/components/HikingSummaryCards";
import HikingTrackSection from "@/features/hiking/components/HikingTrackSection";
import ReplayEntryCard from "@/features/hiking/components/ReplayEntryCard";
import { useHikingSessionDetail } from "@/features/hiking/hooks/useHiking";

export default function HikingSessionDetailPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const numericSessionId = useMemo(() => {
    if (!sessionId) return null;
    const parsed = Number(sessionId);
    return Number.isNaN(parsed) ? null : parsed;
  }, [sessionId]);

  const { session, tracks, elevationProfile, isLoading, isError } =
    useHikingSessionDetail(numericSessionId);

  return (
    <div className="min-h-screen bg-[#f7f7f6] text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-md bg-[#f7f7f6]">
        <header className="sticky top-0 z-30 border-b border-[#89943d]/10 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#4a521e] transition hover:bg-[#89943d]/10"
              aria-label="뒤로가기">
              <span className="text-xl">←</span>
            </button>

            <div className="flex flex-1 flex-col items-center px-2">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#89943d] uppercase">
                ORDA
              </p>
              <h1 className="text-base font-bold tracking-tight text-[#2f3415]">
                등산 세션
              </h1>
            </div>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#4a521e] transition hover:bg-[#89943d]/10"
              aria-label="더보기">
              <span className="text-xl">⋯</span>
            </button>
          </div>
        </header>

        <main className="pb-6">
          {numericSessionId == null ? (
            <div className="px-4 pt-4">
              <section className="rounded-3xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 shadow-sm">
                잘못된 세션 ID입니다.
              </section>
            </div>
          ) : null}

          {isLoading ? (
            <div className="px-4 pt-4">
              <section className="rounded-3xl border border-[#89943d]/10 bg-white px-4 py-4 text-sm text-slate-500 shadow-sm">
                세션 정보를 불러오는 중...
              </section>
            </div>
          ) : null}

          {isError ? (
            <div className="px-4 pt-4">
              <section className="rounded-3xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 shadow-sm">
                세션 상세 정보를 불러오지 못했습니다.
              </section>
            </div>
          ) : null}

          <section className="relative">
            <div className="relative h-[calc(100dvh-65px)] min-h-[520px] overflow-hidden bg-gradient-to-br from-[#dfe6ba] via-[#eef1dc] to-[#f7f7f6]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(137,148,61,0.16),_transparent_55%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(255,255,255,0.18),_rgba(255,255,255,0)_28%,_rgba(0,0,0,0.1)_100%)]" />

              <HikingTrackSection tracks={tracks} />

              <div className="absolute top-4 right-4 left-4 z-20">
                <HikingSessionHeader session={session} />
              </div>

              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f7f7f6] via-[#f7f7f6]/70 to-transparent" />
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-4">
              <div className="pointer-events-auto">
                <HikingSummaryCards
                  session={session}
                  elevationProfile={elevationProfile}
                />
              </div>
            </div>
          </section>

          <div className="space-y-4 px-4 pt-4">
            <ElevationProfileCard elevationProfile={elevationProfile} />
            <ReplayEntryCard sessionId={numericSessionId} />
          </div>
        </main>
      </div>
    </div>
  );
}