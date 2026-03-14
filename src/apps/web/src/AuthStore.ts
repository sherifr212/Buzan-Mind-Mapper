import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@bmm/api-client';

interface AuthState {
  token: string | null;
  email: string | null;
  isOnline: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setOnline: (online: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,

      login: async (email, password) => {
        try {
          const tokens = await apiClient.login(email, password);
          apiClient.setToken(tokens.token);
          set({ token: tokens.token, email });
          return true;
        } catch {
          return false;
        }
      },

      logout: () => {
        apiClient.setToken(null);
        set({ token: null, email: null });
      },

      setOnline: (online) => set({ isOnline: online }),
    }),
    { name: 'bmm-auth' }
  )
);
