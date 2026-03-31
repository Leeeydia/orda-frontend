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

export interface HikingSessionResponse {
  sessionId: number;
  userId: number;
  startedAt: string;
  endedAt: string | null;
  totalDistanceM: number | null;
  totalElevationGainM: number | null;
  totalElevationLossM: number | null;
  totalDurationSec: number | null;
  verifiedSummits: VerifiedSummit[];
}

export interface HikingTrackFeatureProperties {
  trackId: number;
  sequenceNum: number;
  elevationM: number | null;
  accuracyM: number | null;
  recordedAt: string;
}

export interface HikingTrackFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: HikingTrackFeatureProperties;
}

export interface HikingTrackFeatureCollection {
  type: "FeatureCollection";
  features: HikingTrackFeature[];
}

export interface ElevationProfileSummaryResponse {
  totalDistanceMeters: number;
  minElevationMeters: number | null;
  maxElevationMeters: number | null;
  totalElevationGainMeters: number;
  totalElevationLossMeters: number;
  pointCount: number;
}

export interface ElevationProfilePointResponse {
  sequenceNum: number;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  segmentDistanceMeters: number;
  cumulativeDistanceMeters: number;
  elevationDiffMeters: number;
}

export interface ElevationProfileResponse {
  sessionId: number;
  summary: ElevationProfileSummaryResponse;
  points: ElevationProfilePointResponse[];
}

export interface ReplaySummaryResponse {
  totalDistanceMeters: number;
  totalElevationGainMeters: number;
  totalElevationLossMeters: number;
  totalElapsedSeconds: number;
}

export interface ReplayPointResponse {
  latitude: number;
  longitude: number;
  elevationM: number;
  distanceFromStartM: number;
  actualElapsedSeconds: number;
  replayElapsedSeconds: number;
}

export interface ReplayResponse {
  sessionId: number;
  summary: ReplaySummaryResponse;
  points: ReplayPointResponse[];
}

export interface VerifiedSummit {
  summitId: string;
  summitName: string;
  latitude: number;
  longitude: number;
  verifiedAt: string;
  verifiedElapsedSec: number;
}

export interface SummitMarkerItem {
  summitId: string;
  summitName: string;
  latitude: number;
  longitude: number;
  verifiedAt?: string;
}