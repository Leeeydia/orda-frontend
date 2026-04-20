export interface PhotoVerifyRequest {
  sessionId: number;
  latitude: number;
  longitude: number;
  photo: File;
}

export interface PhotoVerifyResponse {
  verified: boolean;
  summitId: string;
  summitName: string;
  distanceM: number;
  verificationMethod: string;
  photoPath: string | null;
  aiRecognizedName: string;
  aiRecognizedElevation: string;
  aiReason: string;
}