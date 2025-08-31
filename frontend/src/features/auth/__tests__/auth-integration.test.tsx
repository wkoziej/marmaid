import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../auth-context'
import { AuthPage } from '../../../app/pages/auth-page'
import { Dashboard } from '../../../app/pages/dashboard'
import { supabase } from '../../../lib/supabase'

// Test component that combines AuthPage and Dashboard with routing logic
function TestApp({ showDashboard = false }: { showDashboard?: boolean }) {
  return (
    <MemoryRouter>
      <AuthProvider>
        {showDashboard ? <Dashboard /> : <AuthPage />}
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
    const logoutButton = screen.getByText('Wyloguj się')
    await user.click(logoutButton)
    
    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })
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