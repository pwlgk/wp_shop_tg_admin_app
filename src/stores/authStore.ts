// src/stores/authStore.ts
import { create } from 'zustand';

// Убедитесь, что 'forbidden' здесь присутствует
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error' | 'forbidden';

type AuthState = {
  token: string | null;
  status: AuthStatus;
  setToken: (token: string) => void;
  setStatus: (status: AuthState['status']) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  status: 'loading',
  setToken: (token) => set({ token, status: 'authenticated' }),
  setStatus: (status) => set({ status }),
  logout: () => set({ token: null, status: 'unauthenticated' }),
}));