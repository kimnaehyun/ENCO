import axios from 'axios';
import { getCachedAccessToken } from '../utils/tokenStorage';

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
  instruction: string;
  types: GroupTypeItem[];
  createdAt: string;
  policy: GroupPolicy;
  groundRules: string;
  card: GroupCard;
}

export interface GroupSettingsResponse {
  message: string;
  result: GroupSettingsResult;
}

export interface GroupMember {
  userId: number;
  name: string;
  role: string;
  joined_at: string;
}

export interface GroupMembersResponse {
  message: string;
  result: {
    members: GroupMember[];
  };
}

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

// 모임정보조회
export async function getGroupSettings(groupId: number | string) {
  const token = getCachedAccessToken();

  const response = await axios.get<GroupSettingsResponse>(
    `https://api.ssafywte.site/auth-service/api/v1/groups/${groupId}/settings`,
    {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
  );

  return response.data;
}

// 모임정보수정
export async function updateGroupSettings(groupId: number | string, requestBody: any) {
  const token = getCachedAccessToken();

  const response = await axios.put(
    `https://api.ssafywte.site/auth-service/api/v1/groups/${groupId}/settings`,
    requestBody,
    {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
  );

  return response.data;
}

//모임원 목록 조회
export async function getGroupMembers(groupId: number | string) {
  const token = getCachedAccessToken();

  const response = await axios.get<GroupMembersResponse>(
    `https://api.ssafywte.site/auth-service/api/v1/groups/${groupId}/members`,
    {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
  );

  return response.data;
}

//모임원 권한 변경
export async function updateGroupMemberRole(
  groupId: number | string,
  userId: number | string,
  requestBody: UpdateMemberRoleRequest,
) {
  const token = getCachedAccessToken();

  const response = await axios.patch<UpdateMemberRoleResponse>(
    `https://api.ssafywte.site/auth-service/api/v1/groups/${groupId}/members/${userId}/role`,
    requestBody,
    {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
  );

  return response.data;
}