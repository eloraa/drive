import { create, type StateCreator } from 'zustand';
import { createSelectors } from './selectors';
import type { AuthState } from '@/types/auth';

const createAuthStore: StateCreator<AuthState> = (set) => ({
  isGoogleSignInLoading: false,
  setGoogleSignInLoading: (loading: boolean) =>
    set({ isGoogleSignInLoading: loading }),
});

const useAuthStoreBase = create<AuthState>()(createAuthStore);

export const useAuthStore = createSelectors(useAuthStoreBase);
