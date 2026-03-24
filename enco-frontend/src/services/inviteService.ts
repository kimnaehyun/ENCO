// src/services/inviteService.ts
import axios from 'axios';
import { getCachedAccessToken } from '../utils/tokenStorage';

const GROUP_BASE_URL = 'https://api.ssafywte.site/auth-service/api/v1';

const inviteApi = axios.create({
  baseURL: GROUP_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

inviteApi.interceptors.request.use(config => {
  const token = getCachedAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── 1) 초대 토큰 생성 (POST /groups/{groupId}/invite) ──

export interface CreateInviteTokenResponse {
  message: string;
  result: {
    token: string;
  };
}

/**
 * 모임 초대 링크용 토큰을 생성합니다.
 * - Request: Authorization Bearer {accessToken}
 * - Response: { message, result: { token } }
 */
export async function createInviteToken(
  groupId: number | string,
): Promise<CreateInviteTokenResponse> {
  const response = await inviteApi.post<CreateInviteTokenResponse>(
    `/groups/${groupId}/invite`,
  );
  return response.data;
}

// ── 2) 초대 수락 (POST /invite/{token}/join) ──

export interface AcceptInviteResponse {
  message: string;
  result: {
    groupId: number;
    groupName: string;
  };
}

/**
 * 초대 토큰으로 모임에 가입합니다.
 * - Request: Authorization Bearer {accessToken}
 * - Endpoint: POST /invite/{token}/join
 * - Response: { message, result: { groupId, groupName } }
 */
export async function acceptInvite(
  inviteToken: string,
): Promise<AcceptInviteResponse> {
  const response = await inviteApi.post<AcceptInviteResponse>(
    `/invite/${inviteToken}/join`,
  );
  return response.data;
}