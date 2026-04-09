import axios from "axios";
import type { TrailGeoJson } from "../types/trail.types";

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
  maxLat: number
): Promise<TrailGeoJson> => {
  const { data } = await axios.get(`${BASE_URL}/map/bbox`, {
    params: { minLng, minLat, maxLng, maxLat }
  });
  return data.data;
};
