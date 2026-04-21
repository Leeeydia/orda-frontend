// GPS 인증 요청/응답
export interface GpsVerifyRequest {
  sessionId: number;
  latitude: number;
  longitude: number;
}

export interface GpsVerifyResponse {
  verified: boolean;
  summitId: string;
  summitName: string;
  distanceM: number;
  verificationMethod: string;
}

// 사진 인증 요청/응답
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
