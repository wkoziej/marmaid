// Integration tests for profile management functionality
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { profileService } from '../profile-service'
import { useProfile, useUpdateProfile, useHasProfile } from '../profile-hooks'
import type { TherapistProfile, ProfileData } from '../auth-types'

// Mock Supabase client
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }
}))

// Mock profile data
const mockProfile: TherapistProfile = {
  id: 'test-user-id',
  profile: {
    name: 'Dr Anna Kowalska',
    credentials: 'Dr hab. psychologii',
    practice_info: 'Gabinet psychoterapeutyczny',
    therapy_school_id: '550e8400-e29b-41d4-a716-446655440000'
  },
  subscription_status: 'free',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z'
}

// Test component using profile hooks
function TestProfileComponent({ userId }: { userId: string }) {
  const { data: profile, isLoading, error } = useProfile(userId)
  const updateProfile = useUpdateProfile(userId)
  const { data: hasProfile } = useHasProfile(userId)

  const handleUpdate = () => {
    updateProfile.mutate({ name: 'Updated Name' })
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <div data-testid="has-profile">{hasProfile ? 'true' : 'false'}</div>
      <div data-testid="profile-name">{profile?.profile?.name || 'No name'}</div>
      <button data-testid="update-button" onClick={handleUpdate}>
        Update Profile
      </button>
      {updateProfile.isPending && <div data-testid="updating">Updating...</div>}
      {updateProfile.isError && (
        <div data-testid="update-error">Update failed</div>
      )}
      {updateProfile.isSuccess && (
        <div data-testid="update-success">Updated successfully</div>
      )}
    </div>
  )
}

function TestWrapper({ children, queryClient }: { 
  children: React.ReactNode 
  queryClient: QueryClient 
}) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Profile Integration Tests', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('ProfileService', () => {
    it('should get profile successfully', async () => {
      const mockSupabaseResponse = {
        data: {
          id: 'test-user-id',
          profile: { name: 'Dr Anna Kowalska' },
          subscription_status: 'free',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        error: null
      }

      const { supabase } = await import('../../../lib/supabase')
      const mockSingle = vi.fn().mockResolvedValue(mockSupabaseResponse)
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

      const result = await profileService.getProfile('test-user-id')

      expect(result.error).toBeNull()
      expect(result.data).toBeTruthy()
      expect(result.data?.profile.name).toBe('Dr Anna Kowalska')
      expect(supabase.from).toHaveBeenCalledWith('therapists')
    })

    it('should handle profile not found', async () => {
      const mockSupabaseResponse = {
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' }
      }

      const { supabase } = await import('../../../lib/supabase')
      const mockSingle = vi.fn().mockResolvedValue(mockSupabaseResponse)
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

      const result = await profileService.getProfile('test-user-id')

      expect(result.error).toBeNull()
      expect(result.data).toBeNull()
    })

    it('should handle access denied error', async () => {
      const mockSupabaseResponse = {
        data: null,
        error: { code: 'PGRST301', message: 'Access denied' }
      }

      const { supabase } = await import('../../../lib/supabase')
      const mockSingle = vi.fn().mockResolvedValue(mockSupabaseResponse)
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

      const result = await profileService.getProfile('test-user-id')

      expect(result.error).toBeTruthy()
      expect(result.error?.status).toBe(403)
      expect(result.data).toBeNull()
    })

    it('should upsert profile successfully', async () => {
      const mockSupabaseResponse = {
        data: {
          id: 'test-user-id',
          profile: { name: 'Dr Anna Kowalska' },
          subscription_status: 'free',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        error: null
      }

      const { supabase } = await import('../../../lib/supabase')
      const mockSingle = vi.fn().mockResolvedValue(mockSupabaseResponse)
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect })
      vi.mocked(supabase.from).mockReturnValue({ upsert: mockUpsert } as any)

      const profileData: Partial<ProfileData> = { name: 'Dr Anna Kowalska' }
      const result = await profileService.upsertProfile('test-user-id', profileData)

      expect(result.error).toBeNull()
      expect(result.data).toBeTruthy()
      expect(result.data?.profile.name).toBe('Dr Anna Kowalska')
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-user-id',
          profile: profileData
        }),
        expect.any(Object)
      )
    })

    it('should update profile successfully', async () => {
      // Mock getting current profile
      const currentProfileResponse = {
        data: {
          id: 'test-user-id',
          profile: { name: 'Old Name', credentials: 'Dr hab.' },
          subscription_status: 'free',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        error: null
      }

      // Mock upsert response
      const upsertResponse = {
        data: {
          id: 'test-user-id',
          profile: { name: 'New Name', credentials: 'Dr hab.' },
          subscription_status: 'free',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T01:00:00Z'
        },
        error: null
      }

      const { supabase } = await import('../../../lib/supabase')
      
      // Setup get profile mock
      const mockGetSingle = vi.fn().mockResolvedValue(currentProfileResponse)
      const mockGetEq = vi.fn().mockReturnValue({ single: mockGetSingle })
      const mockGetSelect = vi.fn().mockReturnValue({ eq: mockGetEq })
      
      // Setup upsert mock
      const mockUpsertSingle = vi.fn().mockResolvedValue(upsertResponse)
      const mockUpsertSelect = vi.fn().mockReturnValue({ single: mockUpsertSingle })
      const mockUpsert = vi.fn().mockReturnValue({ select: mockUpsertSelect })

      // Mock supabase.from to return different mocks based on call order
      let callCount = 0
      vi.mocked(supabase.from).mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return { select: mockGetSelect } as any
        } else {
          return { upsert: mockUpsert } as any
        }
      })

      const updates: Partial<ProfileData> = { name: 'New Name' }
      const result = await profileService.updateProfile('test-user-id', updates)

      expect(result.error).toBeNull()
      expect(result.data).toBeTruthy()
      expect(result.data?.profile.name).toBe('New Name')
      expect(result.data?.profile.credentials).toBe('Dr hab.') // Should preserve existing data
    })
  })

  describe('Profile Hooks Integration', () => {
    it('should load profile data and handle updates', async () => {
      // Mock successful profile fetch
      const mockSupabaseResponse = {
        data: {
          id: 'test-user-id',
          profile: { name: 'Dr Anna Kowalska' },
          subscription_status: 'free',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        error: null
      }

      const { supabase } = await import('../../../lib/supabase')
      const mockSingle = vi.fn().mockResolvedValue(mockSupabaseResponse)
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

      render(
        <TestWrapper queryClient={queryClient}>
          <TestProfileComponent userId="test-user-id" />
        </TestWrapper>
      )

      // Should show loading initially
      expect(screen.getByText('Loading...')).toBeInTheDocument()

      // Should load profile data
      await waitFor(() => {
        expect(screen.getByTestId('profile-name')).toHaveTextContent('Dr Anna Kowalska')
      })

      expect(screen.getByTestId('has-profile')).toHaveTextContent('true')
    })

    it('should handle profile not found', async () => {
      const mockSupabaseResponse = {
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' }
      }

      const { supabase } = await import('../../../lib/supabase')
      const mockSingle = vi.fn().mockResolvedValue(mockSupabaseResponse)
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

      render(
        <TestWrapper queryClient={queryClient}>
          <TestProfileComponent userId="test-user-id" />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('profile-name')).toHaveTextContent('No name')
      })

      expect(screen.getByTestId('has-profile')).toHaveTextContent('false')
    })

    it('should handle update errors gracefully', async () => {
      // Mock successful initial fetch
      const mockGetResponse = {
        data: {
          id: 'test-user-id',
          profile: { name: 'Dr Anna Kowalska' },
          subscription_status: 'free',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        error: null
      }

      // Mock failed update
      const mockUpdateResponse = {
        data: null,
        error: { code: 'PGRST301', message: 'Access denied' }
      }

      const { supabase } = await import('../../../lib/supabase')
      
      let callCount = 0
      vi.mocked(supabase.from).mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call for initial load
          const mockSingle = vi.fn().mockResolvedValue(mockGetResponse)
          const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
          const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
          return { select: mockSelect } as any
        } else {
          // Subsequent calls for update (get current + upsert)
          if (callCount === 2) {
            // Get current profile for update
            const mockSingle = vi.fn().mockResolvedValue(mockGetResponse)
            const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
            const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
            return { select: mockSelect } as any
          } else {
            // Upsert fails
            const mockSingle = vi.fn().mockResolvedValue(mockUpdateResponse)
            const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
            const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect })
            return { upsert: mockUpsert } as any
          }
        }
      })

      render(
        <TestWrapper queryClient={queryClient}>
          <TestProfileComponent userId="test-user-id" />
        </TestWrapper>
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('profile-name')).toHaveTextContent('Dr Anna Kowalska')
      })

      // Trigger update
      const updateButton = screen.getByTestId('update-button')
      updateButton.click()

      // Should show error state after update fails
      await waitFor(() => {
        expect(screen.getByTestId('update-error')).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })
})