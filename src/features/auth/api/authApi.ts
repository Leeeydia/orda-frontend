import type {
  SignupRequest,
  LoginRequest,
  LoginResponseData,
  ApiResponse
} from "../types/auth.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.");
}

const BASE_URL = `${API_BASE_URL}/auth`;

export const signupApi = async (
  body: SignupRequest
): Promise<ApiResponse<null>> => {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
};

export const loginApi = async (
  body: LoginRequest
): Promise<ApiResponse<LoginResponseData>> => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
};

export const kakaoLoginApi = async (
  code: string
): Promise<ApiResponse<LoginResponseData>> => {
  const res = await fetch(`${BASE_URL}/kakao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  });
  return res.json();
};
