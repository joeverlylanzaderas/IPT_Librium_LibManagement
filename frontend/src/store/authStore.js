import { create } from 'zustand';
import { authAPI } from '../api/auth';
import {
  persistTokens,
  loadPersistedTokens,
  removePersistedTokens,
} from '../api/client';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,

  // Called once on app boot — loads tokens into memory then fetches user
  restoreSession: async () => {
    try {
      const { access } = await loadPersistedTokens();

      if (!access) {
        set({ isLoading: false });
        return;
      }

      const userRes = await authAPI.getMe();
      set({ user: userRes.data, isLoading: false });
    } catch (err) {
      console.error('Restore session error:', err);
      await removePersistedTokens();
      set({ user: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await authAPI.login(email, password);
      const { access, refresh } = res.data;

      // Persist to storage AND load into memory so interceptor works immediately
      await persistTokens(access, refresh);

      const userRes = await authAPI.getMe();
      set({ user: userRes.data, isLoading: false });
      return userRes.data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await removePersistedTokens();
    set({ user: null, isLoading: false });
  },

  setUser: (user) => set({ user }),
}));