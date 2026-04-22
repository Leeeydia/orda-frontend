import api from "@/lib/axios";
import type { Top100Mountain } from "../types/mountainTypes";

export const getTop100Mountains = async (): Promise<Top100Mountain[]> => {
  const { data } = await api.get("/mountains/top100");
  return data.data;
};
