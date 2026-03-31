export type { ApiResponse } from "@/types/common.types";

export interface MyPageProfile {
  userId: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
}

export interface MyPageStats {
  totalHikes: number;
  totalSummits: number;
  totalDistanceM: number;
  totalElevationGainM: number;
  totalDurationSec: number;
  lastHikedAt: string | null;
}

export interface HikingRecord {
  sessionId: number;
  status: string;
  startedAt: string;
  endedAt: string | null;
  totalDistanceM: number | null;
  totalElevationGainM: number | null;
  totalDurationSec: number | null;
}
