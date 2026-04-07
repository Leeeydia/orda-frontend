import { useState } from "react";
import { signupApi, loginApi } from "../api/authApi";
import type {
  SignupRequest,
  LoginRequest,
  LoginResponseData
} from "../types/auth.types";

// ─── useSignup ────────────────────────────────────────────────────────────────

export const useSignup = (
  onSuccess: () => void,
  onError: (msg: string) => void
) => {
  const [loading, setLoading] = useState(false);

  const signup = async (data: SignupRequest) => {
    setLoading(true);
    try {
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
};

// ─── useLogin ─────────────────────────────────────────────────────────────────

export const useLogin = (
  onSuccess: (data: LoginResponseData) => void,
  onError: (msg: string) => void
) => {
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
};