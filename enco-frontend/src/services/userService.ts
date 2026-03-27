import axios from 'axios';
import { getCachedAccessToken } from '../utils/tokenStorage';
import type { UserProfile } from '../store/useAuthStore';

const AUTH_BASE_URL = 'https://api.ssafywte.site/auth-service/api/v1';

const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 요청마다 토큰 자동 주입
authApi.interceptors.request.use(async config => {
  const token = getCachedAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── 마이페이지 공통 type ──
export type MyPageInfo = {
  name: string;
  email: string;
  phoneNumber: string;
  birthDay: string;
  gender: 'M' | 'W';
  address: string;
  profileUrl: number;
};

// ── 마이페이지 조회 (GET /auth-service/api/v1/auth/mypage) ──
export type GetMyPageResponse = {
  message: string;
  result: MyPageInfo;
};

export async function GetMyPage(): Promise<GetMyPageResponse> {
  const response = await authApi.get<GetMyPageResponse>(
    `/auth/mypage`,
  );
  return response.data;
}

// ── 마이페이지 수정 (PATCH /auth-service/api/v1/auth/mypage) ──
export type EditMyPageRequest = {
  phoneNumber?: string;
  address?: string;
  profileUrl?: number;
};

export type EditMyPageResponse = {
  message: string;
  result: MyPageInfo;
}

export async function EditMyPage(
  payload: EditMyPageRequest,
): Promise<EditMyPageResponse> {
  const response = await authApi.patch<EditMyPageResponse>(
    `/auth/mypage`,
    payload,
  );
  return response.data;
}