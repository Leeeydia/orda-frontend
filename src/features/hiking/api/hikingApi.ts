import axios from "axios";
import type {
  ApiResponse,
  HikingStartRequest,
  HikingStartResponse,
  HikingEndResponse,
  SummitVerifyRequest,
  SummitVerifyResponse,
  GpsTrackRequest,
  HikingSessionResponse,
  HikingTrackFeatureCollection,
  ElevationProfileResponse,
  ReplayResponse
} from "../types/hiking.types";

export const startHiking = async (
  body: HikingStartRequest
): Promise<HikingStartResponse> => {
  const res = await axios.post<ApiResponse<HikingStartResponse>>(
    "/api/hiking/start",
    body
  );
  return res.data.data;
};

export const endHiking = async (
  sessionId: number
): Promise<HikingEndResponse> => {
  const res = await axios.post<ApiResponse<HikingEndResponse>>(
    `/api/hiking/${sessionId}/end`
  );
  return res.data.data;
};

export const verifySummit = async (
  body: SummitVerifyRequest
): Promise<SummitVerifyResponse> => {
  const res = await axios.post<ApiResponse<SummitVerifyResponse>>(
    "/api/summit/verify",
    body
  );
  return res.data.data;
};

export const saveGpsTrack = async (
  sessionId: number,
  body: GpsTrackRequest
): Promise<void> => {
  await axios.post<ApiResponse<null>>(`/api/hiking/${sessionId}/tracks`, body);
};

export const getHikingSession = async (
  sessionId: number
): Promise<HikingSessionResponse> => {
  const res = await axios.get<ApiResponse<HikingSessionResponse>>(
    `/api/hiking/${sessionId}`
  );
  return res.data.data;
};

export const getHikingTracks = async (
  sessionId: number
): Promise<HikingTrackFeatureCollection> => {
  const res = await axios.get<ApiResponse<HikingTrackFeatureCollection>>(
    `/api/hiking/${sessionId}/tracks`
  );
  return res.data.data;
};

export const getElevationProfile = async (
  sessionId: number
): Promise<ElevationProfileResponse> => {
  const res = await axios.get<ApiResponse<ElevationProfileResponse>>(
    `/api/hiking/${sessionId}/elevation-profile`
  );
  return res.data.data;
};

export const getReplay = async (
  sessionId: number,
  params?: {
    maxPoints?: number;
    targetDurationSeconds?: number;
  }
): Promise<ReplayResponse> => {
  const res = await axios.get<ApiResponse<ReplayResponse>>(
    `/api/hiking/${sessionId}/replay`,
    {
      params
    }
  );
  return res.data.data;
};
