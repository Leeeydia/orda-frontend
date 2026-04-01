import { useQuery } from "@tanstack/react-query";
import {
  getElevationProfile,
  getHikingSession,
  getHikingTracks
} from "../api/hikingApi";

export const useHikingSessionDetail = (sessionId: number | null) => {
  const sessionQuery = useQuery({
    queryKey: ["hiking", "session", sessionId],
    queryFn: () => getHikingSession(sessionId as number),
    enabled: sessionId != null,
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev
  });

  const tracksQuery = useQuery({
    queryKey: ["hiking", "tracks", sessionId],
    queryFn: () => getHikingTracks(sessionId as number),
    enabled: sessionId != null,
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev
  });

  const elevationProfileQuery = useQuery({
    queryKey: ["hiking", "elevation-profile", sessionId],
    queryFn: () => getElevationProfile(sessionId as number),
    enabled: sessionId != null,
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev
  });

  return {
    session: sessionQuery.data ?? null,
    tracks: tracksQuery.data ?? null,
    elevationProfile: elevationProfileQuery.data ?? null,
    sessionQuery,
    tracksQuery,
    elevationProfileQuery,
    isLoading:
      sessionQuery.isLoading ||
      tracksQuery.isLoading ||
      elevationProfileQuery.isLoading,
    isFetching:
      sessionQuery.isFetching ||
      tracksQuery.isFetching ||
      elevationProfileQuery.isFetching,
    isError:
      sessionQuery.isError ||
      tracksQuery.isError ||
      elevationProfileQuery.isError
  };
};