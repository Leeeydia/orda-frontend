// src/features/mypage/hooks/useEditProfile.ts

import { useState, useEffect } from "react";
import type {
  SettingsProfile,
  UpdateProfileRequest,
  ChangePasswordRequest
} from "../types/mypage.types";

const BASE_URL = "http://localhost:8080";

const getToken = () => localStorage.getItem("accessToken");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

const useEditProfile = () => {
  const [profile, setProfile] = useState<SettingsProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 프로필 조회
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/settings/profile`, {
          headers: authHeaders()
        });
        const json = await res.json();
        if (json.success) {
          setProfile(json.data);
        } else {
          setError(json.message);
        }
      } catch {
        setError("프로필을 불러오지 못했습니다");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 닉네임 / 전화번호 수정
  const handleUpdateProfile = async (request: UpdateProfileRequest) => {
    try {
      const res = await fetch(`${BASE_URL}/api/settings/profile`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(request)
      });
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        return { success: true };
      } else {
        return { success: false, message: json.message };
      }
    } catch {
      return { success: false, message: "프로필 수정에 실패했습니다" };
    }
  };

  // 비밀번호 변경
  const handleChangePassword = async (request: ChangePasswordRequest) => {
    try {
      const res = await fetch(`${BASE_URL}/api/settings/password`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(request)
      });
      const json = await res.json();
      if (json.success) {
        return { success: true };
      } else {
        return { success: false, message: json.message };
      }
    } catch {
      return { success: false, message: "비밀번호 변경에 실패했습니다" };
    }
  };

  return {
    profile,
    loading,
    error,
    initialNickname: profile?.nickname ?? "",
    initialPhone: profile?.phone ?? "",
    handleUpdateProfile,
    handleChangePassword
  };
};

export default useEditProfile;
