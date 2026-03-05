import { create } from 'zustand';

interface AuthState {
  user: string | null;
  login: (name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  login: name => set({ user: name }),
  logout: () => set({ user: null }),
}));
