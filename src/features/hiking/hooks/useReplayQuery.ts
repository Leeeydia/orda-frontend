import { useQuery } from "@tanstack/react-query";
import { getReplay } from "../api/hikingApi";
import { mapReplayResponseToReplaySessionModel } from "../mappers/hikingMappers";
import type {
  ReplayQueryParams,
  ReplaySessionModel
} from "../types/hiking.types";

const DEFAULT_REPLAY_PARAMS: Required<ReplayQueryParams> = {
  maxPoints: 300,
  targetDurationSeconds: 60
};

const EMPTY_REPLAY_SESSION_MODEL: ReplaySessionModel = {
  sessionId: 0,
  summary: {
    totalDistanceMeters: 0,
    totalElevationGainMeters: 0,
    totalElevationLossMeters: 0,
    totalElapsedSeconds: 0
  },
  trackPoints: [],
  lineCoordinates: [],
  durationSeconds: 0,
  totalPoints: 0
};

export const useReplayQuery = (
  sessionId: number | null,
  params?: ReplayQueryParams
) => {
  const mergedParams: Required<ReplayQueryParams> = {
    maxPoints: params?.maxPoints ?? DEFAULT_REPLAY_PARAMS.maxPoints,
    targetDurationSeconds:
      params?.targetDurationSeconds ??
      DEFAULT_REPLAY_PARAMS.targetDurationSeconds
  };

  const replayQuery = useQuery({
    queryKey: [
      "hiking",
      "replay",
      sessionId,
      mergedParams.maxPoints,
      mergedParams.targetDurationSeconds
    ],
    queryFn: async () => {
      const replayResponse = await getReplay(sessionId as number, mergedParams);
      return mapReplayResponseToReplaySessionModel(replayResponse);
    },
    enabled: sessionId != null,
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev
  });

  return {
    replay: replayQuery.data ?? EMPTY_REPLAY_SESSION_MODEL,
    replayQuery,
    isLoading: replayQuery.isLoading,
    isFetching: replayQuery.isFetching,
    isError: replayQuery.isError
  };
};