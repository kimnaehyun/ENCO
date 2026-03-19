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