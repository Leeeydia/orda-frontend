import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ReplayMapSection, {
  type ReplayCameraMode
} from "@/features/hiking/components/ReplayMapSection";
import { useReplayQuery } from "@/features/hiking/hooks/useReplayQuery";
import { useReplayPlayer } from "@/features/hiking/hooks/useReplayPlayer";
import { getHikingSession } from "@/features/hiking/api/hikingApi";
import {
  getInterpolatedActualElapsedSeconds
} from "@/features/hiking/mappers/hikingMappers";
import type {
  ReplaySessionModel,
  SummitMarkerItem,
  VerifiedSummit
} from "@/features/hiking/types/hiking.types";
import {
  formatDistanceKm,
  formatDuration,
  formatMeters
} from "@/utils/format";

const INTRO_OVERVIEW_MS = 2200;
const START_FOCUS_MS = 1200;
const OUTRO_OVERVIEW_MS = 1800;
const SEQUENCE_TICK_MS = 50;

type ReplayContentProps = {
  replay: ReplaySessionModel;
  verifiedSummits: VerifiedSummit[];
  onBack: () => void;
};

function formatMsToDisplay(ms: number) {
  const totalSeconds = Math.max(ms / 1000, 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function formatDistanceDisplay(distanceMeters: number | null | undefined) {
  if (distanceMeters == null || Number.isNaN(distanceMeters)) {
    return "-";
  }

  if (distanceMeters >= 1000) {
    return formatDistanceKm(distanceMeters, 2);
  }

  return formatMeters(distanceMeters, 0);
}

function formatPace(
  distanceMeters: number | null | undefined,
  totalElapsedSeconds: number | null | undefined
) {
  if (
    distanceMeters == null ||
    totalElapsedSeconds == null ||
    Number.isNaN(distanceMeters) ||
    Number.isNaN(totalElapsedSeconds) ||
    distanceMeters <= 0 ||
    totalElapsedSeconds <= 0
  ) {
    return "-";
  }

  const paceSeconds = totalElapsedSeconds / (distanceMeters / 1000);
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = Math.floor(paceSeconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function formatElevationDisplay(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "-";
  }

  return `${Math.round(value)}m`;
}

function getReplayCameraMode(
  sequenceElapsedMs: number,
  replayDurationMs: number
): ReplayCameraMode {
  const introEnd = INTRO_OVERVIEW_MS;
  const focusEnd = INTRO_OVERVIEW_MS + START_FOCUS_MS;
  const followEnd = focusEnd + replayDurationMs;

  if (sequenceElapsedMs < introEnd) {
    return "intro-overview";
  }

  if (sequenceElapsedMs < focusEnd) {
    return "focus-start";
  }

  if (sequenceElapsedMs < followEnd) {
    return "follow";
  }

  return "outro-overview";
}

function getStatusText(
  isSequencePlaying: boolean,
  cameraMode: ReplayCameraMode,
  sequenceElapsedMs: number,
  totalSequenceMs: number
) {
  if (isSequencePlaying && cameraMode === "intro-overview") {
    return "전체 경로 확인 중";
  }

  if (isSequencePlaying && cameraMode === "focus-start") {
    return "출발 지점 확인 중";
  }

  if (isSequencePlaying && cameraMode === "follow") {
    return "재생 중";
  }

  if (isSequencePlaying && cameraMode === "outro-overview") {
    return "마무리 중";
  }

  if (sequenceElapsedMs >= totalSequenceMs && totalSequenceMs > 0) {
    return "완료";
  }

  return "재생 준비됨";
}

function ReplaySummarySection({ replay }: { replay: ReplaySessionModel }) {
  const pace = formatPace(
    replay.summary.totalDistanceMeters,
    replay.summary.totalElapsedSeconds
  );

  return (
    <div className="space-y-4 px-4 pt-4">
      <section className="rounded-3xl border border-[#89943d]/10 bg-white px-4 py-4 shadow-sm">
        <div className="mb-3">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#89943d] uppercase">
            기록 요약
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#f7f7f6] px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#89943d] uppercase">
              거리
            </p>
            <p className="mt-1 text-base font-bold text-[#2f3415]">
              {formatDistanceDisplay(replay.summary.totalDistanceMeters)}
            </p>
          </div>

          <div className="rounded-2xl bg-[#f7f7f6] px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#89943d] uppercase">
              시간
            </p>
            <p className="mt-1 text-base font-bold text-[#2f3415]">
              {formatDuration(replay.summary.totalElapsedSeconds)}
            </p>
          </div>

          <div className="rounded-2xl bg-[#f7f7f6] px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#89943d] uppercase">
              상승
            </p>
            <p className="mt-1 text-base font-bold text-[#2f3415]">
              {formatElevationDisplay(replay.summary.totalElevationGainMeters)}
            </p>
          </div>

          <div className="rounded-2xl bg-[#f7f7f6] px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#89943d] uppercase">
              페이스
            </p>
            <p className="mt-1 text-base font-bold text-[#2f3415]">
              {pace}
              {pace !== "-" ? (
                <span className="ml-1 text-xs font-medium text-[#424434]/60">
                  /km
                </span>
              ) : null}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReplayScaffoldState({
  message,
  tone = "neutral"
}: {
  message: string;
  tone?: "neutral" | "error";
}) {
  const sectionClass =
    tone === "error"
      ? "rounded-3xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 shadow-sm"
      : "rounded-3xl border border-[#89943d]/10 bg-white px-4 py-4 text-sm text-slate-600 shadow-sm";

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
          <section className={sectionClass}>{message}</section>
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

function ReplayPageContent({
  replay,
  verifiedSummits,
  onBack
}: ReplayContentProps) {
  const {
    currentPosition,
    currentIndex,
    currentReplaySeconds,
    play,
    pause,
    reset
  } = useReplayPlayer(replay);

  const replayDurationMs = useMemo(() => {
    return Math.round((replay.durationSeconds ?? 0) * 1000);
  }, [replay.durationSeconds]);

  const totalSequenceMs = useMemo(() => {
    return (
      INTRO_OVERVIEW_MS + START_FOCUS_MS + replayDurationMs + OUTRO_OVERVIEW_MS
    );
  }, [replayDurationMs]);

  const [sequenceElapsedMs, setSequenceElapsedMs] = useState(0);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);

  const cameraMode = useMemo(() => {
    return getReplayCameraMode(sequenceElapsedMs, replayDurationMs);
  }, [sequenceElapsedMs, replayDurationMs]);

  const sequenceProgress = useMemo(() => {
    if (totalSequenceMs <= 0) return 0;
    return Math.min(sequenceElapsedMs / totalSequenceMs, 1);
  }, [sequenceElapsedMs, totalSequenceMs]);

  const hasReplayPath = replay.lineCoordinates.length > 0;

  const currentActualElapsedSeconds = useMemo(() => {
    return getInterpolatedActualElapsedSeconds(
      replay.trackPoints,
      currentReplaySeconds
    );
  }, [replay.trackPoints, currentReplaySeconds]);

  const visibleSummits: SummitMarkerItem[] = useMemo(() => {
    return verifiedSummits
      .filter((summit) => {
        const verifiedElapsedSec = Number(summit.verifiedElapsedSec);
        return (
          !Number.isNaN(verifiedElapsedSec) &&
          verifiedElapsedSec <= currentActualElapsedSeconds
        );
      })
      .map((summit) => ({
        summitId: summit.summitId,
        summitName: summit.summitName,
        latitude: Number(summit.latitude),
        longitude: Number(summit.longitude),
        verifiedAt: summit.verifiedAt
      }))
      .filter(
        (summit) =>
          !Number.isNaN(summit.latitude) && !Number.isNaN(summit.longitude)
      );
  }, [verifiedSummits, currentActualElapsedSeconds]);

  useEffect(() => {
    if (!isSequencePlaying) return;
    if (totalSequenceMs <= 0) return;
    if (!hasReplayPath) return;

    const timer = window.setInterval(() => {
      setSequenceElapsedMs((prev) => {
        const next = prev + SEQUENCE_TICK_MS;

        if (next >= totalSequenceMs) {
          setIsSequencePlaying(false);
          return totalSequenceMs;
        }

        return next;
      });
    }, SEQUENCE_TICK_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [isSequencePlaying, totalSequenceMs, hasReplayPath]);

  useEffect(() => {
    if (!hasReplayPath) {
      pause();
      return;
    }

    if (cameraMode === "follow" && isSequencePlaying) {
      play();
      return;
    }

    pause();
  }, [cameraMode, isSequencePlaying, play, pause, hasReplayPath]);

  const handlePlayPause = () => {
    if (!hasReplayPath) return;

    if (isSequencePlaying) {
      setIsSequencePlaying(false);
      pause();
      return;
    }

    if (sequenceElapsedMs >= totalSequenceMs) {
      reset();
      setSequenceElapsedMs(0);
    }

    setIsSequencePlaying(true);
  };

  const handleResetReplay = () => {
    setIsSequencePlaying(false);
    setSequenceElapsedMs(0);
    pause();
    reset();
  };

  const statusText = hasReplayPath
    ? getStatusText(
        isSequencePlaying,
        cameraMode,
        sequenceElapsedMs,
        totalSequenceMs
      )
    : "경로 없음";

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
        <section className="relative">
          <div className="relative h-[56dvh] max-h-[560px] min-h-[380px] overflow-hidden bg-[#f7f7f6]">
            <ReplayMapSection
              replay={replay}
              currentPosition={currentPosition}
              currentIndex={currentIndex}
              cameraMode={cameraMode}
              visibleSummits={visibleSummits}
            />

            <div className="absolute top-4 right-4 left-4 z-20">
              <div className="rounded-3xl border border-white/50 bg-white/88 px-4 py-3 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 truncate">
                    <p className="truncate text-sm tracking-tight text-[#2f3415]">
                      <span className="font-bold text-[#2f3415]">리플레이</span>
                      <span className="mx-1.5 font-medium text-slate-400">
                        ·
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {formatDistanceDisplay(
                          replay.summary.totalDistanceMeters
                        )}{" "}
                        · {formatDuration(replay.summary.totalElapsedSeconds)}
                      </span>
                    </p>
                  </div>

                  <div className="shrink-0 rounded-full bg-[#89943d]/10 px-3 py-1 text-[11px] font-medium text-[#4a521e]">
                    {statusText}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white px-4 pt-4 pb-5">
            <div className="rounded-[28px] border border-[#89943d]/10 bg-[#f7f7f6] px-4 py-4 shadow-sm">
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-[#2f3415]">
                    {formatMsToDisplay(sequenceElapsedMs)} /{" "}
                    {formatMsToDisplay(totalSequenceMs)}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {Math.round(sequenceProgress * 100)}%
                  </p>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-[#89943d]/12">
                  <div
                    className="relative h-full rounded-full bg-[#89943d] transition-[width]"
                    style={{ width: `${sequenceProgress * 100}%` }}>
                    <div className="absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[#89943d] bg-white shadow-sm" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-10">
                <button
                  type="button"
                  disabled={!hasReplayPath}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[#424434]/60 transition enabled:hover:bg-white enabled:hover:text-[#424434] disabled:opacity-30"
                  aria-label="이전 구간">
                  <span className="material-symbols-outlined material-symbols-filled text-[28px]">
                    skip_previous
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handlePlayPause}
                  disabled={!hasReplayPath}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-[#89943d] text-white shadow-lg shadow-[#89943d]/30 transition active:scale-95 disabled:opacity-40"
                  aria-label={isSequencePlaying ? "일시정지" : "재생"}>
                  <span className="material-symbols-outlined material-symbols-filled text-[34px]">
                    {isSequencePlaying ? "pause" : "play_arrow"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleResetReplay}
                  disabled={!hasReplayPath}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[#424434]/60 transition enabled:hover:bg-white enabled:hover:text-[#424434] disabled:opacity-30"
                  aria-label="처음으로">
                  <span className="material-symbols-outlined material-symbols-filled text-[28px]">
                    restart_alt
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {!hasReplayPath ? (
          <div className="px-4 pt-4">
            <section className="rounded-3xl border border-[#89943d]/10 bg-white px-4 py-4 text-sm text-slate-600 shadow-sm">
              표시할 리플레이 경로가 없어 요약 정보만 확인할 수 있습니다.
            </section>
          </div>
        ) : null}

        <ReplaySummarySection replay={replay} />
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

  const sessionQuery = useQuery({
    queryKey: ["hiking", "session", numericSessionId],
    queryFn: () => getHikingSession(numericSessionId as number),
    enabled: numericSessionId != null,
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev
  });

  const verifiedSummits: VerifiedSummit[] =
    sessionQuery.data?.verifiedSummits ?? [];

  if (numericSessionId == null) {
    return <ReplayScaffoldState message="잘못된 세션 ID입니다." tone="error" />;
  }

  if (isError) {
    return (
      <ReplayScaffoldState
        message="리플레이 정보를 불러오지 못했습니다."
        tone="error"
      />
    );
  }

  if (isLoading && replay.totalPoints === 0) {
    return <ReplayScaffoldState message="리플레이 정보를 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f6] text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-md bg-[#f7f7f6]">
        <ReplayPageContent
          key={replay.sessionId}
          replay={replay}
          verifiedSummits={verifiedSummits}
          onBack={() => navigate(-1)}
        />
      </div>
    </div>
  );
}