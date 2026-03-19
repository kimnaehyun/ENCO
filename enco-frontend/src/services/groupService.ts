import { apiClient } from "./apiClient";

export type GroupType = {
  typeId: number;
  typeName: string;
};

export type GroupPolicy = {
  policyId: number;
  dayOfMonth: number;
  monthlyFee: number;
};

export type GroupCard = {
  cardId: number;
  cardName: string;
  frontCardImageUrl: string;
  backCardImageUrl: string;
  isBasic: boolean;
};

export type GroupSettings = {
  groupId: number;
  groupName: string;
  instruction: string;
  types: GroupType[];
  createdAt: string;
  policy: GroupPolicy;
  groundRules: string;
  card: GroupCard;
};

export type GetGroupSettingsResponse = {
  message: string;
  result: GroupSettings;
};

export async function getGroupSettingsService(groupId: number) {
  console.log("[groupService] 요청 시작");
  console.log("[groupService] groupId:", groupId);
  console.log("[groupService] url:", `/groups/${groupId}/settings`);

  const response = await apiClient.get<GetGroupSettingsResponse>(
    `/groups/${groupId}/settings`
  );

  console.log("[groupService] status:", response.status);
  console.log("[groupService] data:", response.data);

  return response.data;
}