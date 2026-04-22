import api from "@/lib/axios";
import type { ApiResponse } from "@/types/common.types";
import type {
  MyPageProfile,
  MyPageStats,
  HikingRecord
} from "../types/mypage.types";

export const fetchProfile = async (): Promise<ApiResponse<MyPageProfile>> => {
  const res = await api.get<ApiResponse<MyPageProfile>>("/mypage/profile");
  return res.data;
};

export const fetchStats = async (): Promise<ApiResponse<MyPageStats>> => {
  const res = await api.get<ApiResponse<MyPageStats>>("/mypage/stats");
  return res.data;
};

export const fetchRecords = async (): Promise<ApiResponse<HikingRecord[]>> => {
  const res = await api.get<ApiResponse<HikingRecord[]>>("/mypage/records");
  return res.data;
};

export const uploadProfileImage = async (
  file: File
): Promise<ApiResponse<string>> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post<ApiResponse<string>>(
    "/mypage/profile-image",
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
  const res = await api.delete<ApiResponse<null>>("/mypage/profile-image");
  return res.data;
};
