// src/features/gps/types/gps.types.ts

// 브라우저 GPS에서 받는 단일 좌표 포인트
export type GpsPoint = {
  lat: number; // 위도
  lng: number; // 경도
  altitude: number | null; // 고도 (미지원 기기는 null)
  accuracy: number; // 오차 반경 (미터, 낮을수록 정확)
  timestamp: number; // 수신 시각 (Unix ms)
};

// useGPS hook이 반환하는 상태
export type GpsState = {
  currentPos: GpsPoint | null; // 현재 위치
  trail: GpsPoint[]; // 누적 경로
  isTracking: boolean; // 추적 중 여부
  error: string | null; // 에러 메시지
};
