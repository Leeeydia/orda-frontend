import axios from "axios";
import type { Top100Mountain } from "../types/mountainTypes";

export const getTop100Mountains = async (): Promise<Top100Mountain[]> => {
  const { data } = await axios.get("/api/mountains/top100");
  return data.data;
};
