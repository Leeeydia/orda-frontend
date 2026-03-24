export interface HikingStartRequest {
  userId: number;
}

export interface HikingStartResponse {
  sessionId: number;
  startedAt: string;
}

export interface HikingEndResponse {
  sessionId: number;
  endedAt: string;
}

export interface SummitVerifyRequest {
  sessionId: number;
  latitude: number;
  longitude: number;
}

export interface SummitVerifyResponse {
  verified: boolean;
  summitId: string;
  summitName: string;
  distanceM: number;
}