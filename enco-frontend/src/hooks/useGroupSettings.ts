//백엔드 연결 후 hook으로 정리하기

import { useState } from 'react';
import { getGroupSettings } from '../services/groupService';

export function useGroupSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type ApiErrorResponse = {
    message?: string;
  };

  type ApiError = {
    response?: {
      data?: ApiErrorResponse;
      status?: number;
    };
  };

  const fetchGroupSettings = async (groupId: number | string) => {
    try {
      console.log('[useGroupSettings] 조회 시작');
      setIsLoading(true);
      setError(null);

      const data = await getGroupSettings(groupId);
      console.log('[useGroupSettings] 조회 성공:', data);

      return data.result;
    } catch (e: unknown) {
      const err = e as ApiError;

      console.log('[useGroupSettings] 조회 실패:', e);
      console.log('[useGroupSettings] 서버 에러:', err.response?.data);
      console.log('[useGroupSettings] status:', err.response?.status);

      const errorMessage =
        err.response?.data?.message ?? '모임 설정 정보 조회에 실패했습니다.';

      setError(errorMessage);
      return null;
    } finally {
      console.log('[useGroupSettings] 조회 종료');
      setIsLoading(false);
    }
  };

  return {
    getGroupSettings: fetchGroupSettings,
    isLoading,
    error,
  };
}
