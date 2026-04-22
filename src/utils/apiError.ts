import axios, { type AxiosError } from "axios";

const STATUS_MESSAGE_MAP: Record<number, string> = {
  400: "잘못된 요청입니다.",
  403: "접근 권한이 없습니다.",
  404: "요청한 정보를 찾을 수 없습니다.",
  409: "이미 처리된 요청입니다.",
  422: "입력값을 다시 확인해주세요."
};

const DEFAULT_MESSAGE = "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.";
const SERVER_ERROR_MESSAGE =
  "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
const TIMEOUT_MESSAGE = "요청 시간이 초과되었습니다.";
const NETWORK_MESSAGE = "네트워크 연결을 확인해주세요.";

/**
 * 백엔드 ApiResponse의 message 필드를 우선 사용하고,
 * 없으면 status code / 네트워크 조건에 따라 한글 메시지를 반환한다.
 * 401은 axios 인터셉터에서 별도 처리하므로 이 매핑에서 제외한다.
 */
export const getApiErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return DEFAULT_MESSAGE;
  }

  const axiosError = error as AxiosError<{ message?: string }>;
  const apiMessage = axiosError.response?.data?.message;
  if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
    return apiMessage;
  }

  if (axiosError.code === "ECONNABORTED") {
    return TIMEOUT_MESSAGE;
  }

  if (!axiosError.response) {
    return NETWORK_MESSAGE;
  }

  const status = axiosError.response.status;
  if (status >= 500) {
    return SERVER_ERROR_MESSAGE;
  }

  return STATUS_MESSAGE_MAP[status] ?? DEFAULT_MESSAGE;
};
