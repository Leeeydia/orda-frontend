import type { NavigateFunction } from "react-router-dom";
import { setAuthFlash } from "./authFlash";

const ACCESS_TOKEN_KEY = "accessToken";

export const clearAuth = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

/**
 * 사용자가 직접 로그아웃 버튼을 눌렀을 때 사용한다.
 * 토큰을 제거하고 스플래시 페이지("/")로 이동한다.
 */
export const logout = (navigate: NavigateFunction) => {
  clearAuth();
  navigate("/", { replace: true });
};

/**
 * 세션 만료(401) 등 자동 로그아웃 상황에서 사용한다.
 * 토큰을 제거하고 flash 메시지를 세팅한 뒤 로그인 페이지("/login")로 이동한다.
 * 이미 /login에 있을 때는 리다이렉트 루프를 막기 위해 이동을 생략한다.
 */
export const forceLogout = (message: string) => {
  clearAuth();
  if (window.location.pathname === "/login") return;
  setAuthFlash(message);
  window.location.assign("/login");
};
