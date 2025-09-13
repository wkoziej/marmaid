// ABOUTME: Authentication service layer providing login, logout, registration functionality
// ABOUTME: Wraps Supabase auth methods with proper error handling and type safety for the application
import { supabase } from './supabase';
import type { User } from './types';

interface AuthError {
  message: string;
  code?: string;
}

interface AuthResponse {
  user: User | null;
  error: AuthError | null;
}

// Login with email and password
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        user: null,
        error: { message: error.message, code: error.status?.toString() },
      };
    }

    if (!data.user) {
      return {
        user: null,
        error: { message: 'No user returned from authentication' },
      };
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      role:
        (data.user.user_metadata?.role as 'therapist' | 'client') ||
        'therapist',
      createdAt: data.user.created_at || '',
      updatedAt: data.user.updated_at || '',
    };

    return { user, error: null };
  } catch (err) {
    return {
      user: null,
      error: {
        message: err instanceof Error ? err.message : 'Unknown error occurred',
      },
    };
  }
};

// Register new user with email and password (requires email verification)
export const register = async (
  email: string,
  password: string,
  role: 'therapist' | 'client' = 'therapist'
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
        },
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (error) {
      return {
        user: null,
        error: { message: error.message, code: error.status?.toString() },
      };
    }

    // With email verification enabled, user will be null until email is verified
    if (!data.user) {
      return {
        user: null,
        error: {
          message:
            'Registration initiated. Please check your email to verify your account.',
        },
      };
    }

    // If user is returned but not confirmed, they need to verify email
    if (!data.user.email_confirmed_at) {
      return {
        user: null,
        error: {
          message:
            'Registration successful! Please check your email and click the verification link to activate your account.',
          code: 'email_not_confirmed',
        },
      };
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      role,
      createdAt: data.user.created_at || '',
      updatedAt: data.user.updated_at || '',
    };

    return { user, error: null };
  } catch (err) {
    return {
      user: null,
      error: {
        message: err instanceof Error ? err.message : 'Unknown error occurred',
      },
    };
  }
};

// Logout current user
export const logout = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        error: { message: error.message, code: error.status?.toString() },
      };
    }

    return { error: null };
  } catch (err) {
    return {
      error: {
        message: err instanceof Error ? err.message : 'Unknown error occurred',
      },
    };
  }
};

// Reset password
export const resetPassword = async (
  email: string
): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return {
        error: { message: error.message, code: error.status?.toString() },
      };
    }

    return { error: null };
  } catch (err) {
    return {
      error: {
        message: err instanceof Error ? err.message : 'Unknown error occurred',
      },
    };
  }
};

// Update password (requires current session)
export const updatePassword = async (
  newPassword: string
): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        error: { message: error.message, code: error.status?.toString() },
      };
    }

    return { error: null };
  } catch (err) {
    return {
      error: {
        message: err instanceof Error ? err.message : 'Unknown error occurred',
      },
    };
  }
};

// Get current session
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
};

// Get current user from session
export const getCurrentUser = async (): Promise<User | null> => {
  const { session } = await getCurrentSession();

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email || '',
    role:
      (session.user.user_metadata?.role as 'therapist' | 'client') ||
      'therapist',
    createdAt: session.user.created_at || '',
    updatedAt: session.user.updated_at || '',
  };
};
