import { useLayoutEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import Header, { HEADER_HEIGHT } from "@/components/layout/Header";
import BackButton from "@/components/layout/BackButton";
import BottomNav from "@/components/layout/BottomNav";
import ElevationProfileCard from "@/features/hiking/components/ElevationProfileCard";
import HikingSessionHeader from "@/features/hiking/components/HikingSessionHeader";
import HikingSummaryCards from "@/features/hiking/components/HikingSummaryCards";
import HikingTrackSection from "@/features/hiking/components/HikingTrackSection";
import ReplayEntryCard from "@/features/hiking/components/ReplayEntryCard";
import { useHikingSessionDetail } from "@/features/hiking/hooks/useHikingSessionDetail";

type SessionDetailStateProps = {
  message: string;
};

const pageOffsetStyle = {
  paddingTop: HEADER_HEIGHT
} as const;

const mapSectionStyle = {
  height: `calc(100dvh - ${HEADER_HEIGHT}px)`
} as const;

const SessionDetailState = ({ message }: SessionDetailStateProps) => {
  return (
    <main
      style={pageOffsetStyle}
      className="bg-bg-page mx-auto w-full max-w-[390px] px-4 pb-24">
      <section className="rounded-3xl border border-error/20 bg-error/10 px-4 py-4 text-sm text-error shadow-sm">
        {message}
      </section>
    </main>
  );
};

export default function HikingSessionDetailPage() {
  const { sessionId } = useParams();

  const numericSessionId = useMemo(() => {
    if (!sessionId) return null;
    const parsed = Number(sessionId);
    return Number.isNaN(parsed) ? null : parsed;
  }, [sessionId]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [numericSessionId]);

  const { session, tracks, elevationProfile, isLoading, isError } =
    useHikingSessionDetail(numericSessionId);

  if (numericSessionId == null) {
    return (
      <div className="min-h-screen bg-bg-page text-body">
        <Header leftSlot={<BackButton />} title="등산 세션" />
        <SessionDetailState message="잘못된 세션 ID입니다." />
        <BottomNav />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-bg-page text-body">
        <Header leftSlot={<BackButton />} title="등산 세션" />
        <SessionDetailState message="세션 상세 정보를 불러오지 못했습니다." />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-page text-body">
      <Header leftSlot={<BackButton />} title="등산 세션" />

      <div
        style={pageOffsetStyle}
        className="bg-bg-page mx-auto w-full max-w-[390px] pb-24">
        <main>
          <section className="relative">
            <div
              style={mapSectionStyle}
              className="relative min-h-[520px] overflow-hidden bg-gradient-to-br from-bg-accent via-bg-soft to-bg-page">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(137,148,61,0.16),_transparent_55%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(255,255,255,0.18),_rgba(255,255,255,0)_28%,_rgba(0,0,0,0.1)_100%)]" />

              <HikingTrackSection
                tracks={tracks}
                verifiedSummits={session?.verifiedSummits ?? []}
              />

              <div className="absolute top-4 right-4 left-4 z-20">
                <HikingSessionHeader session={session} />
              </div>

              {isLoading && !session ? (
                <div className="absolute top-20 right-4 left-4 z-20 rounded-2xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-body/70 shadow-sm">
                  세션 정보를 불러오는 중...
                </div>
              ) : null}

              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg-page via-bg-page/70 to-transparent" />
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

          <div className="space-y-9 px-4 pt-5">
            <ElevationProfileCard elevationProfile={elevationProfile} />
            <ReplayEntryCard sessionId={numericSessionId} />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}