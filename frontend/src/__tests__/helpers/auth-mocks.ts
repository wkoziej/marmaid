import { vi } from 'vitest'
import { supabase } from '../../lib/supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

// Mock user data
export const mockUser: User = {
  id: '123',
  email: 'test@example.com',
  aud: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

export const mockSession: Session = {
  user: mockUser,
  access_token: 'mock_access_token',
  refresh_token: 'mock_refresh_token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer'
}

// Mock auth errors
export const mockAuthErrors = {
  invalidCredentials: { 
    message: 'Invalid login credentials',
    status: 400
  } as AuthError,
  userExists: {
    message: 'User already registered',
    status: 422
  } as AuthError,
  weakPassword: {
    message: 'Password should be at least 6 characters',
    status: 422
  } as AuthError,
  networkError: {
    message: 'Network request failed',
    status: 500
  } as AuthError
}

/**
 * Helper object to easily mock different authentication states
 */
export const mockAuthState = {
  /**
   * Mock authenticated user state
   */
  authenticated: (user: User = mockUser, session: Session = mockSession) => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session },
      error: null
    })
    
    // Also mock onAuthStateChange to return authenticated state
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn()
        }
      }
    })
  },
  
  /**
   * Mock unauthenticated user state
   */
  unauthenticated: () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    })
    
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn()
        }
      }
    })
  },

  /**
   * Mock loading state with delayed response
   */
  loading: (delay: number = 100) => {
    vi.mocked(supabase.auth.getSession).mockImplementation(
      () => new Promise(resolve => 
        setTimeout(() => resolve({
          data: { session: null },
          error: null
        }), delay)
      )
    )
  },

  /**
   * Mock session error
   */
  sessionError: (error: AuthError = mockAuthErrors.networkError) => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error
    })
  }
}

/**
 * Helper object to mock authentication operations
 */
export const mockAuthOperations = {
  /**
   * Mock successful sign up
   */
  signUpSuccess: (user: User = mockUser) => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user, session: null },
      error: null
    })
  },

  /**
   * Mock sign up error
   */
  signUpError: (error: AuthError = mockAuthErrors.userExists) => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null, session: null },
      error
    })
  },

  /**
   * Mock successful sign in
   */
  signInSuccess: (user: User = mockUser, session: Session = mockSession) => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user, session },
      error: null
    })
  },

  /**
   * Mock sign in error
   */
  signInError: (error: AuthError = mockAuthErrors.invalidCredentials) => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error
    })
  },

  /**
   * Mock successful sign out
   */
  signOutSuccess: () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({
      error: null
    })
  },

  /**
   * Mock sign out error
   */
  signOutError: (error: AuthError = mockAuthErrors.networkError) => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({
      error
    })
  }
}

/**
 * Helper to trigger auth state changes in tests
 */
export const triggerAuthStateChange = (
  event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED',
  session?: Session | null
) => {
  const mockCallback = vi.mocked(supabase.auth.onAuthStateChange).mock.calls[0]?.[1]
  if (mockCallback) {
    mockCallback(event, session || null)
  }
}

/**
 * Setup common auth mocks for tests
 */
export const setupAuthMocks = () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default to unauthenticated state
    mockAuthState.unauthenticated()
  })
}

/**
 * Helper to create custom user objects for testing
 */
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  ...mockUser,
  ...overrides
})

/**
 * Helper to create custom session objects for testing
 */
export const createMockSession = (
  user: User = mockUser,
  overrides: Partial<Session> = {}
): Session => ({
  ...mockSession,
  user,
  ...overrides
})

/**
 * Helper to wait for auth state changes in tests
 */
export const waitForAuthStateChange = async () => {
  // Wait for React state updates to complete
  await new Promise(resolve => setTimeout(resolve, 0))
}