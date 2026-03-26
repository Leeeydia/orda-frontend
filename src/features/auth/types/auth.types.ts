export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  name: string;
  phone: string;
  birthDate?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  userId: number;
  nickname: string;
}

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}