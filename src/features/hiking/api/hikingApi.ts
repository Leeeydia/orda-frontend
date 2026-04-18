import api from "@/lib/axios";
import type { ApiResponse } from "@/types/common.types";
import type {
  HikingStartRequest,
  HikingStartResponse,
  HikingEndResponse,
  SummitVerifyRequest,
  SummitVerifyResponse,
  GpsTrackRequest,
  GpsTrackSaveResponse,
  HikingSessionResponse,
  HikingTrackFeatureCollection,
  ElevationProfileResponse,
  ReplayResponse,
  ReplayQueryParams
} from "../types/hiking.types";

export const startHiking = async (
  body: HikingStartRequest
): Promise<HikingStartResponse> => {
  const res = await api.post<ApiResponse<HikingStartResponse>>(
    "/hiking/start",
    body
  );
  return res.data.data;
};

export const endHiking = async (
  sessionId: number
): Promise<HikingEndResponse> => {
  const res = await api.post<ApiResponse<HikingEndResponse>>(
    `/hiking/${sessionId}/end`
  );
  return res.data.data;
};

export const verifySummit = async (
  body: SummitVerifyRequest
): Promise<SummitVerifyResponse> => {
  const res = await api.post<ApiResponse<SummitVerifyResponse>>(
    "/summit/verify",
    body
  );
  return res.data.data;
};

export const saveGpsTrack = async (
  sessionId: number,
  body: GpsTrackRequest
): Promise<GpsTrackSaveResponse> => {
  const res = await api.post<ApiResponse<GpsTrackSaveResponse>>(
    `/hiking/${sessionId}/tracks`,
    body
  );
  return res.data.data;
};

export const getHikingSession = async (
  sessionId: number
): Promise<HikingSessionResponse> => {
  const res = await api.get<ApiResponse<HikingSessionResponse>>(
    `/hiking/${sessionId}`
  );
  return res.data.data;
};

export const getHikingTracks = async (
  sessionId: number
): Promise<HikingTrackFeatureCollection> => {
  const res = await api.get<ApiResponse<HikingTrackFeatureCollection>>(
    `/hiking/${sessionId}/tracks`
  );
  return res.data.data;
};

export const getElevationProfile = async (
  sessionId: number
): Promise<ElevationProfileResponse> => {
  const res = await api.get<ApiResponse<ElevationProfileResponse>>(
    `/hiking/${sessionId}/elevation-profile`
  );
  return res.data.data;
};

export const getReplay = async (
  sessionId: number,
  params?: ReplayQueryParams
): Promise<ReplayResponse> => {
  const res = await api.get<ApiResponse<ReplayResponse>>(
    `/hiking/${sessionId}/replay`,
    {
      params
    }
  );
  return res.data.data;
};
