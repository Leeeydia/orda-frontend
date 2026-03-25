import axios from "axios";
import type {
  HikingStartRequest,
  HikingStartResponse,
  HikingEndResponse,
  SummitVerifyRequest,
  SummitVerifyResponse,
  GpsTrackRequest
} from "../types/hiking.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

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
