import axios from "axios";
import type { ApiResponse } from "@/types/common.types";
import type {
  MyPageProfile,
  MyPageStats,
  HikingRecord
} from "../types/mypage.types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

const mypageAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

mypageAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchProfile = async (): Promise<ApiResponse<MyPageProfile>> => {
  const res = await mypageAxios.get<ApiResponse<MyPageProfile>>(
    "/api/mypage/profile"
  );
  return res.data;
};

export const fetchStats = async (): Promise<ApiResponse<MyPageStats>> => {
  const res =
    await mypageAxios.get<ApiResponse<MyPageStats>>("/api/mypage/stats");
  return res.data;
};

export const fetchRecords = async (): Promise<ApiResponse<HikingRecord[]>> => {
  const res = await mypageAxios.get<ApiResponse<HikingRecord[]>>(
    "/api/mypage/records"
  );
  return res.data;
};

export const uploadProfileImage = async (
  file: File
): Promise<ApiResponse<string>> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await mypageAxios.post<ApiResponse<string>>(
    "/api/mypage/profile-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return res.data;
};

export const deleteProfileImage = async (): Promise<ApiResponse<null>> => {
  const res = await mypageAxios.delete<ApiResponse<null>>(
    "/api/mypage/profile-image"
  );
  return res.data;
};
