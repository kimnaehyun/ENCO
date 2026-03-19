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

// ── 마이페이지 프로필 조회 ──
export type MyPageResponse = {
  message: string;
  result: {
    name: string;
    email: string;
    phoneNumber: string;
    birthDay: string;
    gender: 'M' | 'W';
    address: string;
    profileUrl: string;
  };
};

export async function fetchMyPage(): Promise<UserProfile> {
  const response = await authApi.get<MyPageResponse>('/auth/mypage');
  return response.data.result;
}

// ── 주소 수정 ──
export type UpdateAddressRequest = {
  address: string;
};

export async function updateAddress(payload: UpdateAddressRequest): Promise<void> {
  await authApi.put('/auth/mypage', payload);
}