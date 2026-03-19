import { useState } from "react";
import {
  getGroupSettingsService,
  GroupSettings,
} from "../services/groupService";

export function useGroupSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getGroupSettings = async (
    groupId: number
  ): Promise<GroupSettings | null> => {
    try {
      console.log("[useGroupSettings] 조회 시작");
      setIsLoading(true);
      setError(null);

      const data = await getGroupSettingsService(groupId);
      console.log("[useGroupSettings] 조회 성공:", data);

      return data.result;
    } catch (e: any) {

      console.log("[useGroupSettings] 조회 실패:", e);
      console.log("[useGroupSettings] 서버 에러:", e?.response?.data);
      console.log("[useGroupSettings] status:", e?.response?.status);

      setError(
        e?.response?.data?.message ?? "모임 설정 정보 조회에 실패했습니다."
      );
      return null;
    } finally {
      console.log("[useGroupSettings] 조회 종료");
      setIsLoading(false);
    }
  };

  return {
    getGroupSettings,
    isLoading,
    error,
  };
}