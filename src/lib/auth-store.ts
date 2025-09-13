// ABOUTME: Zustand store for global authentication state management
// ABOUTME: Provides centralized auth state with login, logout and user data persistence across components
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from './types';
import {
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  getCurrentUser,
} from './auth';
import { supabase } from './supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (
    email: string,
    password: string
  ) => Promise<{ user: User | null; error: string | null }>;
  register: (
    email: string,
    password: string,
    role?: 'therapist' | 'client'
  ) => Promise<{ user: User | null; error: string | null }>;
  logout: () => Promise<{ error: string | null }>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      loading: true,
      isAuthenticated: false,

      setUser: user => {
        set({ user, isAuthenticated: !!user });
      },

      setLoading: loading => {
        set({ loading });
      },

      login: async (email, password) => {
        set({ loading: true });

        const { user, error } = await authLogin(email, password);

        if (user) {
          set({ user, isAuthenticated: true, loading: false });
          return { user, error: null };
        } else {
          set({ loading: false });
          return { user: null, error: error?.message || 'Login failed' };
        }
      },

      register: async (email, password, role = 'therapist') => {
        set({ loading: true });

        const { user, error } = await authRegister(email, password, role);

        if (user) {
          set({ user, isAuthenticated: true, loading: false });
          return { user, error: null };
        } else {
          set({ loading: false });
          return { user: null, error: error?.message || 'Registration failed' };
        }
      },

      logout: async () => {
        set({ loading: true });

        const { error } = await authLogout();

        set({ user: null, isAuthenticated: false, loading: false });

        return { error: error?.message || null };
      },

      initialize: async () => {
        set({ loading: true });

        try {
          // Get initial session
          const user = await getCurrentUser();
          set({ user, isAuthenticated: !!user, loading: false });

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const authUser: User = {
                id: session.user.id,
                email: session.user.email || '',
                role:
                  (session.user.user_metadata?.role as
                    | 'therapist'
                    | 'client') || 'therapist',
                createdAt: session.user.created_at || '',
                updatedAt: session.user.updated_at || '',
              };
              set({ user: authUser, isAuthenticated: true });
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, isAuthenticated: false });
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ user: null, isAuthenticated: false, loading: false });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
