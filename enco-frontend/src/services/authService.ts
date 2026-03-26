import axios from 'axios';
import { getCachedAccessToken } from '../utils/tokenStorage';

const AUTH_BASE_URL = 'https://api.ssafywte.site/auth-service/api/v1';

export const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청마다 토큰 자동 주입 (토큰이 있을 때만)
authApi.interceptors.request.use(config => {
  const token = getCachedAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
    email: string;
    phoneNumber: string;
    profileImg: number;
    deviceToken: string;
    accessToken: string;
    expiresIn: number;
    tokenType: string;
  };
};

export async function loginService(
  payload: LoginRequest,
): Promise<LoginResponse> {
  const response = await authApi.post<LoginResponse>('/auth/login', payload);
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
    email: string;
    phoneNumber: string;
    profileImg: number;
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
    '/auth/re-login',
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
  gender: 'M' | 'W';
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

export async function signupService(
  payload: SignupRequest,
): Promise<SignupResponse> {
  const response = await authApi.post<SignupResponse>('/auth/regist', payload);
  return response.data;
}

// ── 통장 개설 (POST /groups/account) ──

export type CreateGroupRequest = {
  name: string;
  groupName: string;
  groupCategory: string[];
  cardProductId: number;
  password: string;
};

export type CreateGroupResponse = {
  message: string;
  result: {
    groupId: number;
    groupName: string;
    accountId: number;
    accountNumber: string;
    cardId: number;
    chatRoomId: number;
  };
};

export async function createGroup(
  payload: CreateGroupRequest,
): Promise<CreateGroupResponse> {
  const response = await authApi.post<CreateGroupResponse>(
    '/groups/account',
    payload,
  );
  return response.data;
}

// ── 모임 타입(카테고리) 조회 (GET /groups/types) ──
// 응답: { message: "...", result: [{typeId, typeName}, ...] }

export type GroupTypeItem = {
  typeId: number;
  typeName: string;
};

export type GetGroupTypeResponse = {
  message: string;
  result: GroupTypeItem[];
};

export async function getGroupType(): Promise<GetGroupTypeResponse> {
  const response = await authApi.get<GetGroupTypeResponse>('/groups/types');
  return response.data;
}

// ── 출석 체크 (POST /users/{groupId}/attend) ──

export type AttendResponse = {
  message: string;
  result: {
    attendanceId: number;
    attendedAt: string;
    totalAttendanceInEvent: number;
    streakDays: number;
    isRewardGranted: boolean;
  };
};

export async function postAttend(groupId: number): Promise<AttendResponse> {
  const response = await authApi.post<AttendResponse>(
    `/users/${groupId}/attend`,
  );
  return response.data;
}

// ── 내 출석 조회 (GET /users/{groupId}/attendances) ──

export type GetMyAttendanceResponse = {
  message: string;
  result: {
    attendanceId: number | null;
    event: {
      eventId: number;
      name: string;
      description: string;
      startDate: string;
      endDate: string;
      startTime: string;
      endTime: string;
      totalDays: number;
      rewardPoint: number;
      targetMemberCount: number;
      currentMemberCount: number;
    };
    totalAttendanceInEvent: number;
    streakDays: number;
    stamps: string[];
  };
};

export async function getMyAttendance(
  groupId: number,
): Promise<GetMyAttendanceResponse> {
  const response = await authApi.get<GetMyAttendanceResponse>(
    `/users/${groupId}/attendances`,
  );
  return response.data;
}
