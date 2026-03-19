import axios from "axios";

const AUTH_BASE_URL = "https://api.ssafywte.site/auth-service/api/v1";

const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── 로그인 ──
export type LoginRequest = {
  pinCode: string;
  deviceToken: string;
};

export type LoginResponse = {
  message: string;
  result: {
    id: number;
    name: string;
    deviceToken: string;
    accessToken: string;
    expiresIn: number;
    tokenType: string;
  };
};

export async function loginService(payload: LoginRequest): Promise<LoginResponse> {
  const response = await authApi.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

// ── 재로그인 (디바이스 토큰 없을 때 폴백) ──
export type ReLoginRequest = {
  email: string;
  password: string;
};

export type ReLoginResponse = {
  message: string;
  result: {
    id: number;
    name: string;
    deviceToken: string;
    accessToken: string;
    expiresIn: number;
    tokenType: string;
  };
};

export async function ReLoginService(
  payload: ReLoginRequest,
): Promise<ReLoginResponse> {
  const response = await authApi.post<ReLoginResponse>(
    "/auth/re-login",
    payload,
  );
  return response.data;
}

// ── 회원가입 ──
export type SignupRequest = {
  name: string;
  email: string;
  password: string;
  birthDay: string; // "2000-01-01"
  phoneNumber: string; // "01012345678"
  gender: "M" | "W";
  pinCode: string; // "1234"
  profileUrl: number;
};

export type SignupResponse = {
  message: string;
  result: {
    id: number;
    deviceToken: string;
  };
};

export async function signupService(payload: SignupRequest): Promise<SignupResponse> {
  const response = await authApi.post<SignupResponse>("/auth/regist", payload);
  return response.data;
}