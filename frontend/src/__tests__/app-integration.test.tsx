import { render, screen, waitFor } from '@testing-library/react'
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
    
    // Mock auth state change subscription
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn()
        }
      }
    })
  })

  it('should redirect unauthenticated users to auth page', async () => {
    // Mock unauthenticated state
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    })

    renderApp()

    // Should show auth page for unauthenticated users
    await waitFor(() => {
      expect(screen.getByText('Zaloguj się do Marmaid')).toBeInTheDocument()
    })

    // Should not show dashboard
    expect(screen.queryByText('Marmaid Dashboard')).not.toBeInTheDocument()
  })

  it('should show dashboard for authenticated users', async () => {
    // Mock authenticated state
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { 
        session: { 
          user: { 
            id: '123', 
            email: 'test@example.com',
            aud: 'authenticated'
          },
          access_token: 'mock_token'
        }
      },
      error: null
    })

    renderApp()

    // Should show dashboard for authenticated users
    await waitFor(() => {
      expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument()
    })

    // Should show user email
    expect(screen.getByText('test@example.com')).toBeInTheDocument()

    // Should not show auth forms
    expect(screen.queryByText('Zaloguj się do Marmaid')).not.toBeInTheDocument()
  })

  it('should handle auth state changes and redirect accordingly', async () => {
    // Start unauthenticated
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    })

    renderApp()

    // Should show auth page initially
    await waitFor(() => {
      expect(screen.getByText('Zaloguj się do Marmaid')).toBeInTheDocument()
    })

    // Simulate successful login by triggering auth state change
    const mockOnAuthStateChange = vi.mocked(supabase.auth.onAuthStateChange)
    const authStateCallback = mockOnAuthStateChange.mock.calls[0]?.[1]
    
    if (authStateCallback) {
      // Simulate SIGNED_IN event
      authStateCallback('SIGNED_IN', {
        user: { 
          id: '123', 
          email: 'test@example.com',
          aud: 'authenticated'
        },
        access_token: 'mock_token'
      })
    }

    // Should redirect to dashboard
    await waitFor(() => {
      expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument()
    })
  })

  it('should handle logout and redirect to auth page', async () => {
    // Start authenticated
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { 
        session: { 
          user: { 
            id: '123', 
            email: 'test@example.com',
            aud: 'authenticated'
          },
          access_token: 'mock_token'
        }
      },
      error: null
    })

    // Mock successful logout
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

    renderApp()

    // Should show dashboard initially
    await waitFor(() => {
      expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument()
    })

    // Click logout
    const user = userEvent.setup()
    const logoutButton = screen.getByText('Wyloguj się')
    await user.click(logoutButton)

    // Simulate SIGNED_OUT event
    const mockOnAuthStateChange = vi.mocked(supabase.auth.onAuthStateChange)
    const authStateCallback = mockOnAuthStateChange.mock.calls[0]?.[1]
    
    if (authStateCallback) {
      authStateCallback('SIGNED_OUT', null)
    }

    // Should redirect to auth page
    await waitFor(() => {
      expect(screen.getByText('Zaloguj się do Marmaid')).toBeInTheDocument()
    })

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
          access_token: 'mock_token'
        }
      },
      error: null
    })

    renderApp()

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
    const mockOnAuthStateChange = vi.mocked(supabase.auth.onAuthStateChange)
    const authStateCallback = mockOnAuthStateChange.mock.calls[0]?.[1]
    
    if (authStateCallback) {
      authStateCallback('SIGNED_IN', {
        user: { 
          id: '123', 
          email: 'test@example.com',
          aud: 'authenticated'
        },
        access_token: 'mock_token'
      })
    }

    // Should redirect to dashboard
    await waitFor(() => {
      expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument()
    })

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