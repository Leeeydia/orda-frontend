import { useState, useEffect } from "react";
import {
  fetchSettingsProfile,
  updateProfile,
  changePassword
} from "../api/editProfile";
import type {
  SettingsProfile,
  UpdateProfileRequest,
  ChangePasswordRequest
} from "../types/editProfile.types";

const useEditProfile = () => {
  const [profile, setProfile] = useState<SettingsProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchSettingsProfile();
        if (res.success) {
          setProfile(res.data);
        } else {
          setError(res.message ?? "프로필을 불러오지 못했습니다");
        }
      } catch {
        setError("프로필을 불러오지 못했습니다");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUpdateProfile = async (request: UpdateProfileRequest) => {
    try {
      const res = await updateProfile(request);
      if (res.success) {
        setProfile(res.data);
        return { success: true };
      } else {
        return { success: false, message: res.message };
      }
    } catch {
      return { success: false, message: "프로필 수정에 실패했습니다" };
    }
  };

  const handleChangePassword = async (request: ChangePasswordRequest) => {
    try {
      const res = await changePassword(request);
      if (res.success) {
        return { success: true };
      } else {
        return { success: false, message: res.message };
      }
    } catch {
      return { success: false, message: "비밀번호 변경에 실패했습니다" };
    }
  };

  return {
    profile,
    loading,
    error,
    handleUpdateProfile,
    handleChangePassword
  };
};

export default useEditProfile;
