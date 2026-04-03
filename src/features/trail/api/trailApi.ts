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
