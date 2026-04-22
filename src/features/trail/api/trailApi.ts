import axios from "axios";
import type { TrailGeoJson } from "../types/trail.types";
import type { ApiResponse } from "@/types/common.types";

const BASE_URL = "";

const trailAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

trailAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const DIFFICULTY_BASE = "/api/trails/difficulty";

export const getTrailDifficultyMap = async (): Promise<TrailGeoJson> => {
  const { data } = await trailAxios.get(`${DIFFICULTY_BASE}/map`);
  return data.data;
};

export const getTrailDifficultyMapBySummit = async (
  summitId: number
): Promise<TrailGeoJson> => {
  const { data } = await trailAxios.get(`${DIFFICULTY_BASE}/map/summit`, {
    params: { summitId }
  });
  return data.data;
};

// bbox 기반 난이도 지도 조회
export const getTrailDifficultyMapByBbox = async (
  minLng: number,
  minLat: number,
  maxLng: number,
  maxLat: number,
  signal?: AbortSignal
): Promise<TrailGeoJson> => {
  const { data } = await trailAxios.get(`${DIFFICULTY_BASE}/map/bbox`, {
    params: { minLng, minLat, maxLng, maxLat },
    signal
  });
  return data.data;
};

// edgeIds 기반 난이도 지도 조회 (GET - 산 단건 클릭용)
export const getTrailDifficultyMapByEdgeIds = async (
  edgeIds: string[],
  signal?: AbortSignal
): Promise<TrailGeoJson> => {
  const { data } = await trailAxios.get(`${DIFFICULTY_BASE}/map/edges`, {
    params: { edgeIds: edgeIds.join(",") },
    signal
  });
  return data.data;
};

// edgeIds 기반 난이도 지도 조회 (POST - 명산 전체 모드용, URL 길이 제한 우회)
export const postTrailDifficultyMapByEdgeIds = async (
  edgeIds: string[],
  signal?: AbortSignal
): Promise<TrailGeoJson> => {
  const { data } = await trailAxios.post(
    `${DIFFICULTY_BASE}/map/edges`,
    edgeIds,
    { signal }
  );
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
  const { data } = await trailAxios.get<ApiResponse<TrailNearbyResult>>(
    "/api/trails/check-nearby",
    { params: { lat, lng } }
  );
  return data.data;
};
