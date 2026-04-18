import api from "@/lib/axios";
import type { TrailGeoJson } from "../types/trail.types";
import type { ApiResponse } from "@/types/common.types";

const TRAIL_DIFFICULTY_PATH = "/trails/difficulty";

export const getTrailDifficultyMap = async (): Promise<TrailGeoJson> => {
  const { data } = await api.get(`${TRAIL_DIFFICULTY_PATH}/map`);
  return data.data;
};

export const getTrailDifficultyMapBySummit = async (
  summitId: number
): Promise<TrailGeoJson> => {
  const { data } = await api.get(`${TRAIL_DIFFICULTY_PATH}/map/summit`, {
    params: { summitId }
  });
  return data.data;
};

// bbox 기반 난이도 지도 조회 함수 추가
export const getTrailDifficultyMapByBbox = async (
  minLng: number,
  minLat: number,
  maxLng: number,
  maxLat: number,
  signal?: AbortSignal
): Promise<TrailGeoJson> => {
  const { data } = await api.get(`${TRAIL_DIFFICULTY_PATH}/map/bbox`, {
    params: { minLng, minLat, maxLng, maxLat },
    signal
  });
  return data.data;
};

// edgeIds 기반 난이도 지도 조회 함수 추가
export const getTrailDifficultyMapByEdgeIds = async (
  edgeIds: string[],
  signal?: AbortSignal
): Promise<TrailGeoJson> => {
  const { data } = await api.get(`${TRAIL_DIFFICULTY_PATH}/map/edges`, {
    params: { edgeIds: edgeIds.join(",") },
    signal
  });
  return data.data;
};

// 등산로 근접 여부 확인
export interface TrailNearbyResult {
  nearTrail: boolean;
  distanceM: number | null;
}

export const checkNearbyTrail = async (
  lat: number,
  lng: number
): Promise<TrailNearbyResult> => {
  const { data } = await api.get<ApiResponse<TrailNearbyResult>>(
    "/trails/check-nearby",
    { params: { lat, lng } }
  );
  return data.data;
};
