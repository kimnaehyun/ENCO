import { useState } from 'react';
import {
  loginService,
  LoginRequest,
  LoginResponse,
} from '../services/authService';
import { saveTokens } from '../utils/tokenStorage';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (
    payload: LoginRequest,
  ): Promise<LoginResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await loginService(payload);
      await saveTokens(data.accessToken, data.refreshToken);
      return data;
    } catch (error: unknown) {
      const errorMessage = (
        error as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      setError(errorMessage ?? '로그인에 실패했어용');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  return {
    login,
    isLoading,
    error,
  };
}
