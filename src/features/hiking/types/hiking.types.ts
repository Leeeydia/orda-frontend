export type ElevationStatus = "DEM" | "INTERPOLATED" | "MISSING" | "GAP";
export type ElevationSummaryStatus = "COMPLETE" | "ESTIMATED" | "UNAVAILABLE";

// saveGpsTrack 응답의 elevationSource 허용값
export type ElevationSource = "dem" | "gps_fallback" | "none";

export interface HikingStartRequest {
  userId: number;
  latitude: number;
  longitude: number;
}

export interface NearbySummitItem {
  summitId: string;
  summitName: string;
  latitude: number;
  longitude: number;
  elevationM: number | null;
}

export interface HikingStartResponse {
  sessionId: number;
  startedAt: string;
  nearbySummits: NearbySummitItem[];
}

// start() 훅 반환 타입 — 성공 여부와 실패 메시지를 같이 반환
export interface HikingStartResult {
  success: boolean;
  errorMessage?: string;
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
  sequenceNum: number;
  latitude: number;
  longitude: number;
  elevationM: number | null;
  accuracyM: number | null;
}

export interface GpsTrackSaveResponse {
  canonicalElevationM: number | null;
  elevationSource: ElevationSource;
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
  totalElevationGainMeters: number | null;
  totalElevationLossMeters: number | null;
  elevationSummaryStatus: ElevationSummaryStatus;
  pointCount: number;
}

export interface ElevationProfilePointResponse {
  sequenceNum: number;
  latitude: number;
  longitude: number;
  elevationMeters: number | null;
  elevationStatus: ElevationStatus;
  segmentDistanceMeters: number;
  cumulativeDistanceMeters: number;
  elevationDiffMeters: number | null;
}

export interface ElevationProfileResponse {
  sessionId: number;
  summary: ElevationProfileSummaryResponse;
  points: ElevationProfilePointResponse[];
}

export interface ReplaySummaryResponse {
  totalDistanceMeters: number;
  totalElevationGainMeters: number | null;
  totalElevationLossMeters: number | null;
  totalElapsedSeconds: number;
  elevationSummaryStatus: ElevationSummaryStatus;
}

export interface ReplayPointResponse {
  latitude: number;
  longitude: number;
  elevationM: number | null;
  distanceFromStartM: number;
  actualElapsedSeconds: number | null;
  replayElapsedSeconds: number;
}

export interface ReplayResponse {
  sessionId: number;
  summary: ReplaySummaryResponse;
  points: ReplayPointResponse[];
}

export interface ReplayQueryParams {
  maxPoints?: number;
  targetDurationSeconds?: number;
}

export interface ReplayTrackPoint {
  lat: number;
  lng: number;
  elevationM: number | null;
  distanceFromStartM: number;
  actualElapsedSeconds: number | null;
  replayElapsedSeconds: number;
}

export type ReplayLineCoordinate = [number, number];

export interface ReplaySessionModel {
  sessionId: number;
  summary: ReplaySummaryResponse;
  trackPoints: ReplayTrackPoint[];
  lineCoordinates: ReplayLineCoordinate[];
  durationSeconds: number;
  totalPoints: number;
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
