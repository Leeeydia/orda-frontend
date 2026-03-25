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
export interface GpsTrackRequest {
  latitude: number;
  longitude: number;
  elevationM: number | null;
  accuracyM: number | null;
}
