import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { supabase } from '../lib/supabase'

// Helper function to render App (already has router built-in)
function renderApp() {
  return render(<App />)
}

describe('App Integration with Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should redirect unauthenticated users to auth page', async () => {
    // Setup mock for this test
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
    
    // Mock unauthenticated state
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    })

    await act(async () => {
      renderApp()
    })

    // Should show auth page for unauthenticated users
    await waitFor(() => {
      expect(screen.getByText('Zaloguj się do Marmaid')).toBeInTheDocument()
    })

    // Should not show dashboard
    expect(screen.queryByText('Marmaid Dashboard')).not.toBeInTheDocument()
  })

  it('should show dashboard for authenticated users', async () => {
    // Setup mock for this test
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
    
    // Mock authenticated state
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { 
        session: { 
          user: { 
            id: '123', 
            email: 'test@example.com',
            aud: 'authenticated'
          },
          access_token: 'mock_token',
          refresh_token: 'mock_refresh_token',
          expires_at: Date.now() / 1000 + 3600,
          expires_in: 3600,
          token_type: 'bearer'
        }
      },
      error: null
    })

    await act(async () => {
      renderApp()
    })

    // Should show dashboard for authenticated users
    await waitFor(() => {
      expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Should show user email
    expect(screen.getByText('test@example.com')).toBeInTheDocument()

    // Should not show auth forms
    expect(screen.queryByText('Zaloguj się do Marmaid')).not.toBeInTheDocument()
  })

  it('should handle auth state changes and redirect accordingly', async () => {
    // Mock auth state change callback 
    let authStateCallback: ((event: string, session: any) => void) | null = null
    
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authStateCallback = callback
      return {
        data: { subscription: { unsubscribe: vi.fn() } }
      }
    })
    
    // Start unauthenticated
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    })

    await act(async () => {
      renderApp()
    })

    // Should show auth page initially
    await waitFor(() => {
      expect(screen.getByText('Zaloguj się do Marmaid')).toBeInTheDocument()
    })

    // Now simulate successful authentication by calling the callback directly
    if (authStateCallback) {
      await act(async () => {
        authStateCallback('SIGNED_IN', {
          user: { 
            id: '123', 
            email: 'test@example.com',
            aud: 'authenticated'
          },
          access_token: 'mock_token',
          refresh_token: 'mock_refresh_token',
          expires_at: Date.now() / 1000 + 3600,
          expires_in: 3600,
          token_type: 'bearer'
        })
      })
    }

    // Should redirect to dashboard
    await waitFor(() => {
      expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should handle logout and redirect to auth page', async () => {
    // Mock auth state change callback 
    let authStateCallback: ((event: string, session: any) => void) | null = null
    
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authStateCallback = callback
      return {
        data: { subscription: { unsubscribe: vi.fn() } }
      }
    })
    
    // Start authenticated
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { 
        session: { 
          user: { 
            id: '123', 
            email: 'test@example.com',
            aud: 'authenticated'
          },
          access_token: 'mock_token',
          refresh_token: 'mock_refresh_token',
          expires_at: Date.now() / 1000 + 3600,
          expires_in: 3600,
          token_type: 'bearer'
        }
      },
      error: null
    })

    // Mock successful logout
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

    await act(async () => {
      renderApp()
    })

    // Should show dashboard initially
    await waitFor(() => {
      expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument()
    })

    // Click logout
    const user = userEvent.setup()
    const logoutButton = screen.getByText('Wyloguj się')
    await user.click(logoutButton)

    // Simulate SIGNED_OUT event
    if (authStateCallback) {
      await act(async () => {
        authStateCallback('SIGNED_OUT', null)
      })
    }

    // Should redirect to auth page
    await waitFor(() => {
      expect(screen.getByText('Zaloguj się do Marmaid')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Should not show dashboard
    expect(screen.queryByText('Marmaid Dashboard')).not.toBeInTheDocument()
  })

  it('should show loading state during auth initialization', async () => {
    // Mock delayed session response
    vi.mocked(supabase.auth.getSession).mockImplementation(
      () => new Promise(resolve => 
        setTimeout(() => resolve({
          data: { session: null },
          error: null
        }), 100)
      )
    )

    renderApp()

    // Should show loading state
    expect(screen.getByText('Ładowanie aplikacji...')).toBeInTheDocument()

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Ładowanie aplikacji...')).not.toBeInTheDocument()
    }, { timeout: 2000 })

    // Should show auth page after loading
    expect(screen.getByText('Zaloguj się do Marmaid')).toBeInTheDocument()
  })

  it('should handle authentication errors gracefully', async () => {
    // Mock auth session error
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: { message: 'Authentication error' }
    })

    renderApp()

    // Should still render auth page even with session error
    await waitFor(() => {
      expect(screen.getByText('Zaloguj się do Marmaid')).toBeInTheDocument()
    })
  })

  it('should complete full authentication flow with routing', async () => {
    const user = userEvent.setup()
    
    // Mock auth state change callback 
    let authStateCallback: ((event: string, session: any) => void) | null = null
    
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authStateCallback = callback
      return {
        data: { subscription: { unsubscribe: vi.fn() } }
      }
    })
    
    // Start unauthenticated
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    })

    // Mock successful login
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { 
        user: { 
          id: '123', 
          email: 'test@example.com',
          aud: 'authenticated'
        }, 
        session: { 
          user: { 
            id: '123', 
            email: 'test@example.com',
            aud: 'authenticated'
          },
          access_token: 'mock_token',
          refresh_token: 'mock_refresh_token',
          expires_at: Date.now() / 1000 + 3600,
          expires_in: 3600,
          token_type: 'bearer'
        }
      },
      error: null
    })

    await act(async () => {
      renderApp()
    })

    // Should show auth page
    await waitFor(() => {
      expect(screen.getByText('Zaloguj się do Marmaid')).toBeInTheDocument()
    })

    // Perform login
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/hasło/i)
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password')
    
    const loginButton = screen.getByRole('button', { name: /zaloguj się/i })
    await user.click(loginButton)

    // Simulate successful auth state change
    if (authStateCallback) {
      await act(async () => {
        authStateCallback('SIGNED_IN', {
          user: { 
            id: '123', 
            email: 'test@example.com',
            aud: 'authenticated'
          },
          access_token: 'mock_token',
          refresh_token: 'mock_refresh_token',
          expires_at: Date.now() / 1000 + 3600,
          expires_in: 3600,
          token_type: 'bearer'
        })
      })
    }

    // Should redirect to dashboard
    await waitFor(() => {
      expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Should show user email in dashboard
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should handle protected routes correctly', async () => {
    // Start unauthenticated
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    })

    renderApp()

    // Should show auth page (not dashboard) for unauthenticated users
    await waitFor(() => {
      expect(screen.getByText('Zaloguj się do Marmaid')).toBeInTheDocument()
    })

    // Dashboard should not be accessible
    expect(screen.queryByText('Marmaid Dashboard')).not.toBeInTheDocument()
    expect(screen.queryByText('Klienci')).not.toBeInTheDocument()
    expect(screen.queryByText('Sesje')).not.toBeInTheDocument()
  })
})