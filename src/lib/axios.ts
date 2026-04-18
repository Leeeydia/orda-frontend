import axios from "axios";
import { setAuthFlash } from "@/utils/authFlash";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.");
}

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error)) {
      // 타임아웃: error.response가 없으므로 401/403 분기를 타지 않는다.
      // 인증은 유효하므로 리다이렉트 없이 flash만 세팅 → 다음 로그인/홈 진입 시 노출.
      if (error.code === "ECONNABORTED") {
        setAuthFlash("서버 응답이 지연됩니다. 잠시 후 다시 시도해주세요.");
      } else if (error.response) {
        const status = error.response.status;
        const currentPath = window.location.pathname;

        if (status === 401) {
          localStorage.removeItem("accessToken");
          if (currentPath !== "/login") {
            setAuthFlash("로그인이 만료되었습니다. 다시 로그인해 주세요.");
            window.location.assign("/login");
          }
        } else if (status === 403) {
          if (currentPath !== "/") {
            setAuthFlash("접근 권한이 없습니다.");
            window.location.assign("/");
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
