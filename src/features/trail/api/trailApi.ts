import axios from "axios";
import type { TrailGeoJson } from "../types/trail.types";
import type { ApiResponse } from "@/types/common.types";

const BASE_URL = "/api/trails/difficulty";

export const getTrailDifficultyMap = async (): Promise<TrailGeoJson> => {
  const { data } = await axios.get(`${BASE_URL}/map`);
  return data.data;
};

export const getTrailDifficultyMapBySummit = async (
  summitId: number
): Promise<TrailGeoJson> => {
  const { data } = await axios.get(`${BASE_URL}/map/summit`, {
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
  const { data } = await axios.get(`${BASE_URL}/map/bbox`, {
    params: { minLng, minLat, maxLng, maxLat },
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
  const { data } = await axios.get<ApiResponse<TrailNearbyResult>>(
    "/api/trails/check-nearby",
    { params: { lat, lng } }
  );
  return data.data;
};
