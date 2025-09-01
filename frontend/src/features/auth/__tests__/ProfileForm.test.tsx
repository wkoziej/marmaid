// Unit tests for ProfileForm component
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProfileForm } from '../ProfileForm'
import * as useAuthHook from '../use-auth'
import * as profileHooks from '../profile-hooks'

// Mock hooks
vi.mock('../use-auth')
vi.mock('../profile-hooks')

// Mock shadcn/ui components
vi.mock('../../../components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="card-title">{children}</h2>,
}))

vi.mock('../../../components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, variant, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      data-variant={variant}
      data-testid={props['data-testid'] || 'button'}
      {...props}
    >
      {children}
    </button>
  ),
}))

vi.mock('../../../components/ui/input', () => ({
  Input: ({ className, ...props }: any) => (
    <input
      className={className}
      data-testid={props.id || 'input'}
      {...props}
    />
  ),
}))

vi.mock('../../../components/ui/textarea', () => ({
  Textarea: ({ className, ...props }: any) => (
    <textarea
      className={className}
      data-testid={props.id || 'textarea'}
      {...props}
    />
  ),
}))

vi.mock('../../../components/ui/label', () => ({
  Label: ({ children, ...props }: any) => (
    <label {...props} data-testid="label">
      {children}
    </label>
  ),
}))

// Test wrapper with QueryClient
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

// Mock data
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  updated_at: '2025-01-01T00:00:00Z'
}

const mockProfile = {
  id: 'test-user-id',
  profile: {
    name: 'Dr Anna Kowalska',
    credentials: 'Dr hab. psychologii',
    practice_info: 'Gabinet psychoterapeutyczny w Warszawie',
    therapy_school_id: '',
  },
  subscription_status: 'free' as const,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z'
}

describe('ProfileForm', () => {
  const mockUseAuth = vi.mocked(useAuthHook.useAuth)
  const mockUseProfile = vi.mocked(profileHooks.useProfile)
  const mockUseUpdateProfile = vi.mocked(profileHooks.useUpdateProfile)

  const mockUpdateProfile = {
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
  }

  beforeEach(() => {
    // Setup default mocks
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    })

    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    mockUseUpdateProfile.mockReturnValue(mockUpdateProfile as any)

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should render profile form with pre-filled data', async () => {
    render(
      <TestWrapper>
        <ProfileForm />
      </TestWrapper>
    )

    expect(screen.getByTestId('card-title')).toHaveTextContent('Profil zawodowy')
    
    // Wait for form to be populated with default values
    await waitFor(() => {
      const nameInput = screen.getByTestId('name') as HTMLInputElement
      expect(nameInput.value).toBe('Dr Anna Kowalska')
    })

    const credentialsInput = screen.getByTestId('credentials') as HTMLInputElement
    expect(credentialsInput.value).toBe('Dr hab. psychologii')

    const practiceInfoTextarea = screen.getByTestId('practice_info') as HTMLTextAreaElement
    expect(practiceInfoTextarea.value).toBe('Gabinet psychoterapeutyczny w Warszawie')
  })

  it('should display loading state when profile is loading', () => {
    mockUseProfile.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any)

    render(
      <TestWrapper>
        <ProfileForm />
      </TestWrapper>
    )

    expect(screen.getByTestId('card-description')).toHaveTextContent('Zarządzaj swoimi danymi zawodowymi i preferencjami')
  })

  it('should show validation errors for invalid input', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ProfileForm />
      </TestWrapper>
    )

    // Clear the name field (required field)
    const nameInput = screen.getByTestId('name')
    await user.clear(nameInput)
    
    // Try to submit the form
    const submitButton = screen.getByRole('button', { name: /zapisz profil/i })
    await user.click(submitButton)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/imię i nazwisko musi mieć co najmniej 2 znaki/i)).toBeInTheDocument()
    })
  })

  it('should call updateProfile on form submission', async () => {
    const user = userEvent.setup()
    const mockMutateAsync = vi.fn().mockResolvedValue(mockProfile)
    mockUpdateProfile.mutateAsync = mockMutateAsync

    render(
      <TestWrapper>
        <ProfileForm />
      </TestWrapper>
    )

    // Modify the name field
    const nameInput = screen.getByTestId('name')
    await user.clear(nameInput)
    await user.type(nameInput, 'Dr Jan Nowak')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /zapisz profil/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'Dr Jan Nowak',
        credentials: 'Dr hab. psychologii',
        practice_info: 'Gabinet psychoterapeutyczny w Warszawie',
        therapy_school_id: '',
      })
    })
  })

  it('should call onSuccess callback after successful update', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const mockMutateAsync = vi.fn().mockResolvedValue(mockProfile)
    mockUpdateProfile.mutateAsync = mockMutateAsync

    render(
      <TestWrapper>
        <ProfileForm onSuccess={onSuccess} />
      </TestWrapper>
    )

    // Modify a field to make form dirty
    const nameInput = screen.getByTestId('name')
    await user.type(nameInput, ' Updated')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /zapisz profil/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should show error state when update fails', async () => {
    mockUseUpdateProfile.mockReturnValue({
      ...mockUpdateProfile,
      isError: true,
      error: new Error('Update failed'),
    } as any)

    render(
      <TestWrapper>
        <ProfileForm />
      </TestWrapper>
    )

    expect(screen.getByText(/błąd podczas zapisywania profilu/i)).toBeInTheDocument()
    expect(screen.getByText(/wystąpił błąd podczas zapisywania twojego profilu/i)).toBeInTheDocument()
  })

  it('should show success state when update succeeds', async () => {
    mockUseUpdateProfile.mockReturnValue({
      ...mockUpdateProfile,
      isSuccess: true,
    } as any)

    render(
      <TestWrapper>
        <ProfileForm />
      </TestWrapper>
    )

    expect(screen.getByText(/profil został zaktualizowany/i)).toBeInTheDocument()
    expect(screen.getByText(/twoje dane zawodowe zostały pomyślnie zapisane/i)).toBeInTheDocument()
  })

  it('should disable submit button when form is submitting', async () => {
    mockUseUpdateProfile.mockReturnValue({
      ...mockUpdateProfile,
      isPending: true,
    } as any)

    render(
      <TestWrapper>
        <ProfileForm />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /zapisywanie/i })
    expect(submitButton).toBeDisabled()
  })

  it('should reset form when reset button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ProfileForm />
      </TestWrapper>
    )

    // Modify a field
    const nameInput = screen.getByTestId('name')
    await user.clear(nameInput)
    await user.type(nameInput, 'Modified Name')

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /przywróć/i })
    await user.click(resetButton)

    // Field should be reset to original value
    await waitFor(() => {
      expect((nameInput as HTMLInputElement).value).toBe('Dr Anna Kowalska')
    })
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(
      <TestWrapper>
        <ProfileForm onCancel={onCancel} />
      </TestWrapper>
    )

    const cancelButton = screen.getByRole('button', { name: /anuluj/i })
    await user.click(cancelButton)

    expect(onCancel).toHaveBeenCalled()
  })

  it('should validate credentials field length', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ProfileForm />
      </TestWrapper>
    )

    const credentialsInput = screen.getByTestId('credentials')
    
    // Enter text longer than 200 characters
    const longCredentials = 'A'.repeat(201)
    await user.clear(credentialsInput)
    await user.type(credentialsInput, longCredentials)

    // Submit form
    const submitButton = screen.getByRole('button', { name: /zapisz profil/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/kwalifikacje nie mogą przekraczać 200 znaków/i)).toBeInTheDocument()
    })
  })

  it('should validate practice info field length', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ProfileForm />
      </TestWrapper>
    )

    const practiceInfoTextarea = screen.getByTestId('practice_info')
    
    // Enter text longer than 500 characters
    const longPracticeInfo = 'A'.repeat(501)
    await user.clear(practiceInfoTextarea)
    await user.type(practiceInfoTextarea, longPracticeInfo)

    // Submit form
    const submitButton = screen.getByRole('button', { name: /zapisz profil/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/informacje o praktyce nie mogą przekraczać 500 znaków/i)).toBeInTheDocument()
    })
  })
})