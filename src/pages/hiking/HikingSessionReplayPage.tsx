import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ReplayMapSection, {
  type ReplayCameraMode
} from "@/features/hiking/components/ReplayMapSection";
import ReplayScaffoldState from "@/features/hiking/components/ReplayScaffoldState";
import ReplaySummarySection from "@/features/hiking/components/ReplaySummarySection";
import { useReplayQuery } from "@/features/hiking/hooks/useReplayQuery";
import { useReplayPlayer } from "@/features/hiking/hooks/useReplayPlayer";
import { getHikingSession } from "@/features/hiking/api/hikingApi";
import {
  getInterpolatedActualElapsedSeconds,
  mapSequenceToReplaySeconds
} from "@/features/hiking/mappers/hikingMappers";
import type {
  ReplaySessionModel,
  SummitMarkerItem,
  VerifiedSummit
} from "@/features/hiking/types/hiking.types";
import { formatDistanceKm, formatDuration, formatMeters } from "@/utils/format";

const INTRO_OVERVIEW_MS = 2200;
const START_FOCUS_MS = 1200;
const OUTRO_OVERVIEW_MS = 1800;
const SEQUENCE_TICK_MS = 50;
const SEEK_STEP_SECONDS = 5;

type ReplayContentProps = {
  replay: ReplaySessionModel;
  verifiedSummits: VerifiedSummit[];
  isSummitInfoError: boolean;
  onBack: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

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

function ReplayPageContent({
  replay,
  verifiedSummits,
  isSummitInfoError,
  onBack
}: ReplayContentProps) {
  const replayDurationMs = useMemo(() => {
    return Math.round((replay.durationSeconds ?? 0) * 1000);
  }, [replay.durationSeconds]);

  const totalSequenceMs = useMemo(() => {
    return (
      INTRO_OVERVIEW_MS + START_FOCUS_MS + replayDurationMs + OUTRO_OVERVIEW_MS
    );
  }, [replayDurationMs]);

  const replayStartMs = INTRO_OVERVIEW_MS + START_FOCUS_MS;
  const replayEndMs = replayStartMs + replayDurationMs;

  // sequence 기준 elapsed ms 상태
  const [sequenceElapsedMs, setSequenceElapsedMs] = useState(0);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);

  // sequence → replaySeconds 변환 (hikingMappers 활용)
  const currentReplaySeconds = useMemo(() => {
    return mapSequenceToReplaySeconds(
      sequenceElapsedMs,
      replayStartMs,
      replayEndMs,
      replay.durationSeconds ?? 0
    );
  }, [sequenceElapsedMs, replayStartMs, replayEndMs, replay.durationSeconds]);

  // 새 useReplayPlayer: replay + replaySeconds를 받아서 위치 계산만 담당
  const { currentPosition, currentIndex } = useReplayPlayer({
    replay,
    replaySeconds: currentReplaySeconds
  });

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

  // 시퀀스 타이머
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

  const handlePlayPause = () => {
    if (!hasReplayPath) return;

    if (isSequencePlaying) {
      setIsSequencePlaying(false);
      return;
    }

    if (sequenceElapsedMs >= totalSequenceMs) {
      setSequenceElapsedMs(0);
    }

    setIsSequencePlaying(true);
  };

  const handleSeekBySequenceMs = (targetSequenceMs: number) => {
    const clampedSequenceMs = clamp(targetSequenceMs, 0, totalSequenceMs);
    setSequenceElapsedMs(clampedSequenceMs);
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSeekBySequenceMs(Number(event.target.value));
  };

  const handleBackward = () => {
    if (!hasReplayPath) return;

    setSequenceElapsedMs((prev) =>
      clamp(prev - SEEK_STEP_SECONDS * 1000, 0, totalSequenceMs)
    );
  };

  const handleResetReplay = () => {
    setIsSequencePlaying(false);
    setSequenceElapsedMs(0);
  };

  const statusText = isSummitInfoError
    ? "정상 정보 불러오지 못함"
    : hasReplayPath
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
            <div className="rounded-[28px] border border-[#89943d]/10 bg-[#f7f7f6] px-4 py-5 shadow-sm">
              <div className="mb-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-[#2f3415]">
                    {formatMsToDisplay(sequenceElapsedMs)} /{" "}
                    {formatMsToDisplay(totalSequenceMs)}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {Math.round(sequenceProgress * 100)}%
                  </p>
                </div>

                <input
                  type="range"
                  min={0}
                  max={totalSequenceMs}
                  step={SEQUENCE_TICK_MS}
                  value={sequenceElapsedMs}
                  onChange={handleSliderChange}
                  className="h-3 w-full accent-[#89943d]"
                />
              </div>

              <div className="flex items-center justify-center gap-10">
                <button
                  type="button"
                  onClick={handleBackward}
                  disabled={!hasReplayPath}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[#424434]/60 transition enabled:hover:bg-white enabled:hover:text-[#424434] disabled:opacity-30"
                  aria-label="5초 뒤로">
                  <span className="material-symbols-outlined material-symbols-filled text-[28px]">
                    replay_5
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

  const verifiedSummits: VerifiedSummit[] = useMemo(() => {
    if (sessionQuery.isError || !sessionQuery.data) return [];

    return sessionQuery.data.verifiedSummits ?? [];
  }, [sessionQuery.isError, sessionQuery.data]);

  const isSummitInfoError = sessionQuery.isError;

  if (numericSessionId == null) {
    return <ReplayScaffoldState message="잘못된 세션 ID입니다." tone="error" onBack={() => navigate(-1)} />;
  }

  if (isError) {
    return (
      <ReplayScaffoldState
        message="리플레이 정보를 불러오지 못했습니다."
        tone="error"
        onBack={() => navigate(-1)}
      />
    );
  }

  if (isLoading && replay.totalPoints === 0) {
    return <ReplayScaffoldState message="리플레이 정보를 불러오는 중..." onBack={() => navigate(-1)} />;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f6] text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-md bg-[#f7f7f6]">
        <ReplayPageContent
          key={replay.sessionId}
          replay={replay}
          verifiedSummits={verifiedSummits}
          isSummitInfoError={isSummitInfoError}
          onBack={() => navigate(-1)}
        />
      </div>
    </div>
  );
}
