import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../auth-context'
import { AuthPage } from '../../../app/pages/auth-page'
import { Dashboard } from '../../../app/pages/dashboard'
import { supabase } from '../../../lib/supabase'

// Test component that combines AuthPage and Dashboard with routing logic
function TestApp({ showDashboard = false }: { showDashboard?: boolean }) {
  return (
    <MemoryRouter initialEntries={[showDashboard ? '/dashboard' : '/auth']}>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('Authentication Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful session initially empty
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    })

    // Mock auth state change subscription
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn()
        }
      }
    })
  })

  it('should complete registration flow successfully', async () => {
    const user = userEvent.setup()
    
    // Mock successful registration
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { 
        user: { id: '123', email: 'test@example.com' }, 
        session: null 
      },
      error: null
    })

    render(<TestApp />)

    // Switch to registration form
    const registerLink = screen.getByText('Utwórz konto')
    await user.click(registerLink)

    await waitFor(() => {
      expect(screen.getByText('Utwórz konto Marmaid')).toBeInTheDocument()
    })

    // Fill registration form
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText('Hasło')
    const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i)
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'TestPass123')
    await user.type(confirmPasswordInput, 'TestPass123')
    
    const registerButton = screen.getByRole('button', { name: /utwórz konto/i })
    await user.click(registerButton)
    
    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'TestPass123'
      })
    })

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/sprawdź swoją skrzynkę/i)).toBeInTheDocument()
    })
  })

  it('should complete login flow successfully', async () => {
    const user = userEvent.setup()
    
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

    render(<TestApp />)

    await waitFor(() => {
      expect(screen.getByText('Zaloguj się do Marmaid')).toBeInTheDocument()
    })

    // Fill login form
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/hasło/i)
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'TestPass123')
    
    const loginButton = screen.getByRole('button', { name: /zaloguj się/i })
    await user.click(loginButton)
    
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'TestPass123'
      })
    })
  })

  it('should handle login errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock login error
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' }
    })

    render(<TestApp />)

    // Fill login form with invalid credentials
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/hasło/i)
    
    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpassword')
    
    const loginButton = screen.getByRole('button', { name: /zaloguj się/i })
    await user.click(loginButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
    })
  })

  it('should handle registration errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock registration error
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered' }
    })

    render(<TestApp />)

    // Switch to registration form
    const registerLink = screen.getByText('Utwórz konto')
    await user.click(registerLink)

    // Fill registration form
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText('Hasło')
    const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i)
    
    await user.type(emailInput, 'existing@example.com')
    await user.type(passwordInput, 'TestPass123')
    await user.type(confirmPasswordInput, 'TestPass123')
    
    const registerButton = screen.getByRole('button', { name: /utwórz konto/i })
    await user.click(registerButton)
    
    await waitFor(() => {
      expect(screen.getByText('User already registered')).toBeInTheDocument()
    })
  })

  it('should complete logout flow successfully', async () => {
    const user = userEvent.setup()
    
    // Mock authenticated session
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

    render(<TestApp showDashboard={true} />)

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument()
    })

    // Should display user email
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    
    // Click logout
    const logoutButton = screen.getByTestId('logout-button')
    await user.click(logoutButton)
    
    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })
  })

  it('should show loading indicator during logout process', async () => {
    const user = userEvent.setup()
    
    // Mock authenticated session
    const mockSession = {
      user: { 
        id: '123', 
        email: 'test@example.com',
        aud: 'authenticated'
      },
      access_token: 'mock_token'
    }
    
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    // Mock auth state subscription with immediate SIGNED_IN callback
    const mockSubscription = { unsubscribe: vi.fn() }
    const mockCallback = vi.fn()
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      mockCallback.mockImplementation(callback)
      // Immediately call with SIGNED_IN to set up initial state
      setTimeout(() => callback('SIGNED_IN', mockSession), 0)
      return { data: { subscription: mockSubscription } }
    })

    // Mock slow logout to see loading state - delay the promise resolution
    let resolveLogout: (value: any) => void
    const logoutPromise = new Promise(resolve => {
      resolveLogout = resolve
    })
    vi.mocked(supabase.auth.signOut).mockReturnValue(logoutPromise)

    render(<TestApp showDashboard={true} />)

    await waitFor(() => {
      expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument()
    })
    
    // Click logout
    const logoutButton = screen.getByTestId('logout-button')
    await user.click(logoutButton)
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Wylogowywanie...')).toBeInTheDocument()
    })

    // Should disable button during logout
    await waitFor(() => {
      expect(logoutButton).toBeDisabled()
    })

    // Resolve logout and trigger SIGNED_OUT event
    resolveLogout!({ error: null })
    mockCallback('SIGNED_OUT', null)

    await waitFor(() => {
      expect(screen.queryByText('Wylogowywanie...')).not.toBeInTheDocument()
    })
  })

  it('should handle logout errors gracefully and allow retry', async () => {
    const user = userEvent.setup()
    
    // Mock authenticated session
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

    // Mock logout error
    vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
      error: { message: 'Network error' }
    })

    render(<TestApp showDashboard={true} />)

    await waitFor(() => {
      expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument()
    })
    
    // Click logout
    const logoutButton = screen.getByTestId('logout-button')
    await user.click(logoutButton)
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/wystąpił błąd podczas wylogowywania/i)).toBeInTheDocument()
    })

    // Button should be enabled for retry
    expect(logoutButton).not.toBeDisabled()

    // Mock successful retry
    vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null })
    
    // Click logout again to retry
    await user.click(logoutButton)
    
    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalledTimes(2)
    })

    // Error message should disappear
    await waitFor(() => {
      expect(screen.queryByText(/wystąpił błąd podczas wylogowywania/i)).not.toBeInTheDocument()
    })
  })

  it('should prevent multiple rapid logout clicks', async () => {
    const user = userEvent.setup()
    
    // Mock authenticated session
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

    // Mock slow logout
    let resolveLogout: (value: any) => void
    const logoutPromise = new Promise(resolve => {
      resolveLogout = resolve
    })
    vi.mocked(supabase.auth.signOut).mockReturnValue(logoutPromise)

    render(<TestApp showDashboard={true} />)

    await waitFor(() => {
      expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument()
    })
    
    const logoutButton = screen.getByTestId('logout-button')
    
    // Click logout multiple times rapidly
    await user.click(logoutButton)
    await user.click(logoutButton)
    await user.click(logoutButton)
    
    // Should only call signOut once
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1)

    // Resolve logout
    resolveLogout!({ error: null })
  })

  it('should have proper accessibility attributes for logout button', async () => {
    // Mock authenticated session
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

    render(<TestApp showDashboard={true} />)

    await waitFor(() => {
      expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument()
    })
    
    const logoutButton = screen.getByTestId('logout-button')
    
    // Should have proper aria-label
    expect(logoutButton).toHaveAttribute('aria-label', 'Wyloguj się')
    
    // Should be accessible by role
    expect(screen.getByRole('button', { name: /wyloguj się/i })).toBeInTheDocument()
  })

  it('should switch between login and register forms', async () => {
    const user = userEvent.setup()
    
    render(<TestApp />)

    // Should start with login form
    expect(screen.getByText('Zaloguj się do Marmaid')).toBeInTheDocument()
    
    // Switch to register
    await user.click(screen.getByText('Utwórz konto'))
    
    await waitFor(() => {
      expect(screen.getByText('Utwórz konto Marmaid')).toBeInTheDocument()
    })
    
    // Switch back to login
    await user.click(screen.getByText('Zaloguj się'))
    
    await waitFor(() => {
      expect(screen.getByText('Zaloguj się do Marmaid')).toBeInTheDocument()
    })
  })

  it('should validate registration form properly', async () => {
    const user = userEvent.setup()
    
    render(<TestApp />)

    // Switch to registration
    await user.click(screen.getByText('Utwórz konto'))

    // Try to submit with invalid data
    const registerButton = screen.getByRole('button', { name: /utwórz konto/i })
    await user.click(registerButton)

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/wprowadź prawidłowy adres email/i)).toBeInTheDocument()
    })

    // Fill email but invalid password
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')
    
    const passwordInput = screen.getByLabelText('Hasło')
    await user.type(passwordInput, '123') // Too short
    
    await user.click(registerButton)

    await waitFor(() => {
      expect(screen.getByText(/hasło musi mieć co najmniej 6 znaków/i)).toBeInTheDocument()
    })
  })
})