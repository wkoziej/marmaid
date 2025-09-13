// ABOUTME: Unit tests for authentication service functions
// ABOUTME: Tests login, register, logout, resetPassword functions with proper mocking
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  login,
  register,
  logout,
  resetPassword,
  getCurrentUser,
} from '../auth';
import { supabase } from '../supabase';

// Mock Supabase client
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should return user on successful login', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        user_metadata: { role: 'therapist' },
      };

      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await login('test@example.com', 'password123');

      expect(result.user).toEqual({
        id: '123',
        email: 'test@example.com',
        role: 'therapist',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });
      expect(result.error).toBeNull();
    });

    it('should return error on failed login', async () => {
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      });

      const result = await login('test@example.com', 'wrongpassword');

      expect(result.user).toBeNull();
      expect(result.error?.message).toBe('Invalid credentials');
    });

    it('should handle exceptions', async () => {
      (supabase.auth.signInWithPassword as any).mockRejectedValue(
        new Error('Network error')
      );

      const result = await login('test@example.com', 'password123');

      expect(result.user).toBeNull();
      expect(result.error?.message).toBe('Network error');
    });
  });

  describe('register', () => {
    it('should return email verification message on successful registration', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        user_metadata: { role: 'therapist' },
        email_confirmed_at: null, // Email not confirmed yet
      };

      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await register(
        'test@example.com',
        'password123',
        'therapist'
      );

      // With email verification required, user should be null and error should contain verification message
      expect(result.user).toBeNull();
      expect(result.error?.message).toContain('check your email');
      expect(result.error?.code).toBe('email_not_confirmed');
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { role: 'therapist' },
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });
    });

    it('should return user on successful registration with confirmed email', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        user_metadata: { role: 'therapist' },
        email_confirmed_at: '2024-01-01', // Email is confirmed
      };

      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await register(
        'test@example.com',
        'password123',
        'therapist'
      );

      expect(result.user).toEqual({
        id: '123',
        email: 'test@example.com',
        role: 'therapist',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });
      expect(result.error).toBeNull();
    });

    it('should return error on failed registration', async () => {
      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: null },
        error: { message: 'Email already exists' },
      });

      const result = await register('test@example.com', 'password123');

      expect(result.user).toBeNull();
      expect(result.error?.message).toBe('Email already exists');
    });
  });

  describe('logout', () => {
    it('should return null error on successful logout', async () => {
      (supabase.auth.signOut as any).mockResolvedValue({
        error: null,
      });

      const result = await logout();

      expect(result.error).toBeNull();
    });

    it('should return error on failed logout', async () => {
      (supabase.auth.signOut as any).mockResolvedValue({
        error: { message: 'Logout failed' },
      });

      const result = await logout();

      expect(result.error?.message).toBe('Logout failed');
    });
  });

  describe('resetPassword', () => {
    it('should return null error on successful reset request', async () => {
      (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({
        error: null,
      });

      const result = await resetPassword('test@example.com');

      expect(result.error).toBeNull();
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: `${window.location.origin}/reset-password` }
      );
    });

    it('should return error on failed reset request', async () => {
      (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({
        error: { message: 'User not found' },
      });

      const result = await resetPassword('test@example.com');

      expect(result.error?.message).toBe('User not found');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from current session', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        user_metadata: { role: 'therapist' },
      };

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      const result = await getCurrentUser();

      expect(result).toEqual({
        id: '123',
        email: 'test@example.com',
        role: 'therapist',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });
    });

    it('should return null when no session', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });
  });
});
