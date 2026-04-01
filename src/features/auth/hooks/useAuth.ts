import { useState } from "react";
import { signupApi, loginApi } from "../api/authApi";
import type {
  SignupRequest,
  LoginRequest,
  LoginResponseData
} from "../types/auth.types";

// ─── Validation ───────────────────────────────────────────────────────────────

export const validate = {
  email: (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? ""
      : "올바른 이메일 형식을 입력해주세요.",

  password: (v: string) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(v)
      ? ""
      : "8자 이상, 영문 + 숫자 + 특수문자(!@#$%^&*)를 포함해야 합니다.",

  nickname: (v: string) =>
    /^[가-힣a-zA-Z0-9]{2,10}$/.test(v)
      ? ""
      : "한글/영문/숫자 2~10자로 입력해주세요.",

  name: (v: string) =>
    /^[가-힣a-zA-Z]{2,20}$/.test(v) ? "" : "한글/영문 2~20자로 입력해주세요.",

  // 사용자 입력: 010-XXXX-XXXX / 전송 시: 하이픈 제거 후 01012345678
  phone: (v: string) =>
    /^01[0-9]-\d{3,4}-\d{4}$/.test(v)
      ? ""
      : "010-XXXX-XXXX 형식으로 입력해주세요.",

  // type="text" 기반 자동 포맷 (YYYY-MM-DD)
  birthDate: (v: string) => {
    if (!v) return "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "날짜를 끝까지 입력해주세요.";
    const date = new Date(v);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isNaN(date.getTime()) || date >= today
      ? "과거 날짜를 입력해주세요."
      : "";
  }
};

// ─── useSignup ────────────────────────────────────────────────────────────────

export function useSignup(
  onSuccess: () => void,
  onError: (msg: string) => void
) {
  const [loading, setLoading] = useState(false);

  const signup = async (data: SignupRequest) => {
    setLoading(true);
    try {
      // 전송 전 전화번호 정규화: 하이픈 제거 후 숫자만 전송
      const normalized: SignupRequest = {
        ...data,
        phone: data.phone.replace(/-/g, "")
      };
      const res = await signupApi(normalized);
      if (res.success) {
        onSuccess();
      } else {
        onError(res.message);
      }
    } catch {
      onError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading };
}

// ─── useLogin ─────────────────────────────────────────────────────────────────

export function useLogin(
  onSuccess: (data: LoginResponseData) => void,
  onError: (msg: string) => void
) {
  const [loading, setLoading] = useState(false);

  const login = async (data: LoginRequest) => {
    setLoading(true);
    try {
      const res = await loginApi(data);
      if (res.success && res.data) {
        localStorage.setItem("accessToken", res.data.accessToken);
        onSuccess(res.data);
      } else {
        onError(res.message);
      }
    } catch {
      onError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
