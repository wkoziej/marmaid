// ABOUTME: Custom hook for authentication state management with Supabase
// ABOUTME: Provides centralized auth state, login/logout functions and session management
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  login as authLogin,
  logout as authLogout,
  register as authRegister,
} from '@/lib/auth';
import type { User } from '@/lib/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const authUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          role:
            (session.user.user_metadata?.role as 'therapist' | 'client') ||
            'therapist',
          createdAt: session.user.created_at || '',
          updatedAt: session.user.updated_at || '',
        };
        setUser(authUser);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const authUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          role:
            (session.user.user_metadata?.role as 'therapist' | 'client') ||
            'therapist',
          createdAt: session.user.created_at || '',
          updatedAt: session.user.updated_at || '',
        };
        setUser(authUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authLogin(email, password);
    return result;
  };

  const register = async (
    email: string,
    password: string,
    role: 'therapist' | 'client' = 'therapist'
  ) => {
    const result = await authRegister(email, password, role);
    return result;
  };

  const logout = async () => {
    const result = await authLogout();
    return result;
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};
