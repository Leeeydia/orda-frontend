// src/features/edit-profile/api/editProfile.ts

import axios from "axios";
import type { ApiResponse } from "@/types/common.types";
import type {
  SettingsProfile,
  UpdateProfileRequest,
  ChangePasswordRequest
} from "../types/editProfile.types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

const editProfileAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

editProfileAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchSettingsProfile = async (): Promise<
  ApiResponse<SettingsProfile>
> => {
  const res = await editProfileAxios.get<ApiResponse<SettingsProfile>>(
    "/api/settings/profile"
  );
  return res.data;
};

export const updateProfile = async (
  request: UpdateProfileRequest
): Promise<ApiResponse<SettingsProfile>> => {
  // 전송 전 전화번호 하이픈 제거 — useSignup과 동일한 정책 (010XXXXXXXX)
  const normalized: UpdateProfileRequest = {
    ...request,
    ...(request.phone && { phone: request.phone.replace(/-/g, "") })
  };
  const res = await editProfileAxios.patch<ApiResponse<SettingsProfile>>(
    "/api/settings/profile",
    normalized
  );
  return res.data;
};

export const changePassword = async (
  request: ChangePasswordRequest
): Promise<ApiResponse<null>> => {
  const res = await editProfileAxios.patch<ApiResponse<null>>(
    "/api/settings/password",
    request
  );
  return res.data;
};
