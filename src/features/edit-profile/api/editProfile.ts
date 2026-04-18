// src/features/edit-profile/api/editProfile.ts

import api from "@/lib/axios";
import type { ApiResponse } from "@/types/common.types";
import type {
  SettingsProfile,
  UpdateProfileRequest,
  ChangePasswordRequest
} from "../types/editProfile.types";

export const fetchSettingsProfile = async (): Promise<
  ApiResponse<SettingsProfile>
> => {
  const res = await api.get<ApiResponse<SettingsProfile>>("/settings/profile");
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
  const res = await api.patch<ApiResponse<SettingsProfile>>(
    "/settings/profile",
    normalized
  );
  return res.data;
};

export const changePassword = async (
  request: ChangePasswordRequest
): Promise<ApiResponse<null>> => {
  const res = await api.patch<ApiResponse<null>>(
    "/settings/password",
    request
  );
  return res.data;
};
