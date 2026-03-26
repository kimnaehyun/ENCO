import { create } from 'zustand';

export interface UserProfile {
  name: string;
  email: string;
  phoneNumber: string;
  birthDay: string;
  gender: 'M' | 'W';
  address: string;
  profileUrl: string | number;
}

interface AuthState {
  /** 로그인 여부 판단 (기존 호환) */
  user: string | null;
  /** 상세 프로필 */
  profile: UserProfile | null;
  userId: number | null;

  login: (name: string) => void;
  setProfile: (profile: UserProfile) => void;
  loginWithProfile: (
    name: string,
    profile: UserProfile,
    userId: number,
  ) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  profile: null,
  userId: null,

  login: name => set({ user: name }),
  setProfile: profile => set({ profile }),
  loginWithProfile: (name, profile, userId) =>
    set({ user: name, profile, userId }),
  logout: () => set({ user: null, profile: null }),
}));
