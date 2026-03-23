import axios from 'axios';
import { getCachedAccessToken } from '../utils/tokenStorage';

const GROUP_BASE_URL = 'https://api.ssafywte.site/auth-service/api/v1';

const groupApi = axios.create({
  baseURL: GROUP_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청마다 토큰 자동 주입
groupApi.interceptors.request.use(config => {
  const token = getCachedAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── 모임 설정 조회 (GET /groups/{groupId}/settings) ──

export interface GroupTypeItem {
  typeId: number;
  typeName: string;
}

export interface GroupPolicy {
  policyId: number;
  dayOfMonth: number;
  monthlyFee: number;
}

export interface GroupCard {
  cardId: number;
  cardName: string;
  frontCardImageUrl: string;
  backCardImageUrl: string;
  isBasic: boolean;
}

export interface GroupSettingsResult {
  groupId: number;
  groupName: string;
  introduction: string | null;
  types: GroupTypeItem[];
  createdAt: string;
  policy: GroupPolicy | null;
  groundRule: string | null;
  card: GroupCard | null;
}

export interface GroupSettingsResponse {
  message: string;
  result: GroupSettingsResult;
}

export async function getGroupSettings(
  groupId: number | string,
): Promise<GroupSettingsResponse> {
  const response = await groupApi.get<GroupSettingsResponse>(
    `/groups/${groupId}/settings`,
  );
  return response.data;
}

// ── 모임 설정 수정 (PUT /groups/{groupId}/settings) ──

export interface UpdateGroupSettingsRequest {
  groupName: string;
  introduction: string;
  typeIds: number[];
  policy: {
    policyId: number;
    dayOfMonth: number;
    monthlyFee: number;
  };
  groundRules: string;
}

export interface UpdateGroupSettingsResponse {
  message: string;
  result: null;
}

export async function updateGroupSettings(
  groupId: number | string,
  payload: UpdateGroupSettingsRequest,
): Promise<UpdateGroupSettingsResponse> {
  const response = await groupApi.patch<UpdateGroupSettingsResponse>(
    `/groups/${groupId}/settings`,
    payload,
  );
  return response.data;
}

// ── 모임원 목록 조회 (GET /groups/{groupId}/members) ──

export interface GroupMember {
  userId: number;
  name?: string;
  role: string;
  joinedAt?: string;
  joined_at?: string;
}

export interface GroupMembersResponse {
  message: string;
  result: GroupMember[];
}

export async function getGroupMembers(
  groupId: number | string,
): Promise<GroupMembersResponse> {
  const response = await groupApi.get<GroupMembersResponse>(
    `/groups/${groupId}/members`,
  );
  return response.data;
}

// ── 모임원 권한 변경 (PATCH /groups/{groupId}/members/{userId}/role) ──

export interface UpdateMemberRoleRequest {
  role: 'TREASURER' | 'USER';
}

export interface UpdateMemberRoleResponse {
  message: string;
  result: {
    userId: number;
    role: 'TREASURER' | 'USER';
    changed: boolean;
  };
}

export async function updateGroupMemberRole(
  groupId: number | string,
  userId: number | string,
  payload: UpdateMemberRoleRequest,
): Promise<UpdateMemberRoleResponse> {
  const response = await groupApi.patch<UpdateMemberRoleResponse>(
    `/groups/${groupId}/members/${userId}/role`,
    payload,
  );
  return response.data;
}

// 내 모임(대표카드) 전체 목록 조회
export interface MyGroupAccount {
  accountId: number;
  accountNumber: string;
  balance: number;
}

export interface MyGroupCard {
  cardId: number;
  frontImageUrl: string;
}

export interface MyGroupItem {
  groupId: number;
  groupName: string;
  role: string;
  account: MyGroupAccount;
  card: MyGroupCard | null;
}

export interface MyGroupsResponse {
  message: string;
  result: MyGroupItem[];
}

export async function getMyGroups(): Promise<MyGroupsResponse> {
  const response = await groupApi.get<MyGroupsResponse>('/users/me/groups');
  return response.data;
}