import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  fetchProfile,
  fetchStats,
  fetchRecords,
  uploadProfileImage,
  deleteProfileImage
} from "../api/mypage";
import type {
  MyPageProfile,
  MyPageStats,
  HikingRecord
} from "../types/mypage.types";
import type { ApiResponse } from "@/types/common.types";

const useMyPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MyPageProfile | null>(null);
  const [stats, setStats] = useState<MyPageStats | null>(null);
  const [records, setRecords] = useState<HikingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

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
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const msg =
            (err.response?.data as ApiResponse<unknown>)?.message ??
            "데이터를 불러오는 데 실패했습니다.";
          setError(msg);
        } else {
          setError("데이터를 불러오는 데 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [navigate]);

  const handleUploadImage = async (
    file: File
  ): Promise<ApiResponse<string>> => {
    try {
      const res = await uploadProfileImage(file);
      if (res.success) {
        setProfile((prev) =>
          prev ? { ...prev, profileImageUrl: res.data } : prev
        );
      }
      return res;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return (
          (err.response?.data as ApiResponse<string>) ?? {
            success: false,
            message: "이미지 업로드에 실패했습니다.",
            data: ""
          }
        );
      }

      return {
        success: false,
        message: "이미지 업로드에 실패했습니다.",
        data: ""
      };
    }
  };

  const handleDeleteImage = async (): Promise<ApiResponse<null>> => {
    try {
      const res = await deleteProfileImage();
      if (res.success) {
        setProfile((prev) =>
          prev ? { ...prev, profileImageUrl: null } : prev
        );
      }
      return res;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return (
          (err.response?.data as ApiResponse<null>) ?? {
            success: false,
            message: "이미지 삭제에 실패했습니다.",
            data: null
          }
        );
      }

      return {
        success: false,
        message: "이미지 삭제에 실패했습니다.",
        data: null
      };
    }
  };

  return {
    profile,
    stats,
    records,
    loading,
    error,
    handleUploadImage,
    handleDeleteImage
  };
};

export default useMyPage;
