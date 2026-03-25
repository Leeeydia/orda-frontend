import { useState, useEffect } from "react";
import {
  fetchProfile,
  fetchStats,
  fetchRecords,
  updateProfile,
  changePassword,
  uploadProfileImage,
  deleteProfileImage
} from "../api/mypage";
import type {
  MyPageProfile,
  MyPageStats,
  HikingRecord
} from "../types/mypage.types";

const useMyPage = () => {
  const [profile, setProfile] = useState<MyPageProfile | null>(null);
  const [stats, setStats] = useState<MyPageStats | null>(null);
  const [records, setRecords] = useState<HikingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [profileRes, statsRes, recordsRes] = await Promise.all([
          fetchProfile(),
          fetchStats(),
          fetchRecords()
        ]);
        setProfile(profileRes.data);
        setStats(statsRes.data);
        setRecords(recordsRes.data);
      } catch {
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const handleUpdateProfile = async (nickname: string) => {
    const res = await updateProfile(nickname);
    if (res.success) {
      setProfile((prev) => (prev ? { ...prev, nickname } : prev));
    }
    return res;
  };

  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    const res = await changePassword(currentPassword, newPassword);
    return res;
  };

  const handleUploadImage = async (file: File) => {
    const res = await uploadProfileImage(file);
    if (res.success) {
      setProfile((prev) =>
        prev ? { ...prev, profileImageUrl: res.data } : prev
      );
    }
    return res;
  };

  const handleDeleteImage = async () => {
    const res = await deleteProfileImage();
    if (res.success) {
      setProfile((prev) => (prev ? { ...prev, profileImageUrl: null } : prev));
    }
    return res;
  };

  return {
    profile,
    stats,
    records,
    loading,
    error,
    handleUpdateProfile,
    handleChangePassword,
    handleUploadImage,
    handleDeleteImage
  };
};

export default useMyPage;
