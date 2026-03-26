import type { SignupRequest, LoginRequest, LoginResponseData, ApiResponse } from '../types/auth.types';

const BASE_URL = 'http://localhost:8080/api/auth';

export async function signupApi(body: SignupRequest): Promise<ApiResponse<null>> {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function loginApi(body: LoginRequest): Promise<ApiResponse<LoginResponseData>> {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}