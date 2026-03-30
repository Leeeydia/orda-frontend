// 공통 API 응답 래퍼
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// 프로필
export interface MyPageProfile {
  userId: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  createdAt: string;
}

// 통계
export interface MyPageStats {
  totalHikes: number;
  totalSummits: number;
  totalDistanceM: number;
  totalElevationGainM: number;
  totalDurationSec: number;
  lastHikedAt: string | null;
}

// 등산 기록 단건
export interface HikingRecord {
  sessionId: number;
  status: string;
  startedAt: string;
  endedAt: string | null;
  totalDistanceM: number | null;
  totalElevationGainM: number | null;
  totalDurationSec: number | null;
}
export interface SettingsProfile {
  userId: number;
  email: string;
  nickname: string;
  name: string;
  phone: string | null;
  birthDate: string | null;
  profileImageUrl: string | null;
}

// 프로필 수정 요청
export interface UpdateProfileRequest {
  nickname?: string;
  phone?: string;
}

// 비밀번호 변경 요청
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}