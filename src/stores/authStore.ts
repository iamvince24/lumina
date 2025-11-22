/**
 * 認證狀態管理 Store
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string | null;
  name: string | null;
}

interface AuthState {
  /** 當前使用者 */
  user: User | null;

  /** 認證 token */
  token: string | null;

  /** 是否已認證 */
  isAuthenticated: boolean;

  /** 設定使用者資訊 */
  setUser: (user: User, token: string) => void;

  /** 登出 */
  logout: () => void;
}

/**
 * 認證 Store
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'lumina-auth',
      // 只持久化必要的資訊
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
