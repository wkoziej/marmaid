// ABOUTME: React Query hooks for therapist profile management
// ABOUTME: Provides useProfile, useUpdateProfile, and related hooks with caching and optimistic updates

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService } from './profile-service'
import type { ProfileData, TherapistProfile, ProfileApiError } from './auth-types'

// Query keys for consistent caching
export const profileQueryKeys = {
  all: ['profile'] as const,
  profile: (userId: string) => ['profile', userId] as const,
  hasProfile: (userId: string) => ['profile', 'has-profile', userId] as const,
}

/**
 * Hook to fetch therapist profile data
 */
export function useProfile(userId: string | null) {
  return useQuery({
    queryKey: profileQueryKeys.profile(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required')
      
      const response = await profileService.getProfile(userId)
      if (response.error) throw response.error
      
      return response.data
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on 403 (access denied) or 404 (not found)
      const profileError = error as ProfileApiError
      if (profileError?.status === 403 || profileError?.status === 404) {
        return false
      }
      return failureCount < 3
    },
  })
}

/**
 * Hook to check if user has a profile
 */
export function useHasProfile(userId: string | null) {
  return useQuery({
    queryKey: profileQueryKeys.hasProfile(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required')
      
      const response = await profileService.hasProfile(userId)
      if (response.error) throw response.error
      
      return response.hasProfile
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to create or update therapist profile
 */
export function useUpsertProfile(userId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (profileData: Partial<ProfileData>) => {
      if (!userId) throw new Error('User ID is required')
      
      const response = await profileService.upsertProfile(userId, profileData)
      if (response.error) throw response.error
      
      return response.data
    },
    onSuccess: (data) => {
      if (!userId || !data) return

      // Update profile cache
      queryClient.setQueryData(profileQueryKeys.profile(userId), data)
      
      // Update hasProfile cache
      queryClient.setQueryData(profileQueryKeys.hasProfile(userId), true)
      
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.all
      })
    },
    onError: (error) => {
      console.error('Profile upsert failed:', error)
    },
  })
}

/**
 * Hook to update specific profile fields
 */
export function useUpdateProfile(userId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Partial<ProfileData>) => {
      if (!userId) throw new Error('User ID is required')
      
      const response = await profileService.updateProfile(userId, updates)
      if (response.error) throw response.error
      
      return response.data
    },
    onMutate: async (updates) => {
      if (!userId) return

      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: profileQueryKeys.profile(userId) })

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<TherapistProfile | null>(
        profileQueryKeys.profile(userId)
      )

      // Optimistically update profile
      if (previousProfile) {
        const optimisticProfile: TherapistProfile = {
          ...previousProfile,
          profile: { ...previousProfile.profile, ...updates },
          updated_at: new Date().toISOString(),
        }
        
        queryClient.setQueryData(profileQueryKeys.profile(userId), optimisticProfile)
      }

      // Return context with snapshot
      return { previousProfile }
    },
    onSuccess: (data) => {
      if (!userId || !data) return

      // Update profile cache with server response
      queryClient.setQueryData(profileQueryKeys.profile(userId), data)
    },
    onError: (error, variables, context) => {
      if (!userId) return

      // Rollback optimistic update on error
      if (context?.previousProfile !== undefined) {
        queryClient.setQueryData(profileQueryKeys.profile(userId), context.previousProfile)
      }
      
      console.error('Profile update failed:', error)
    },
    onSettled: () => {
      if (!userId) return

      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.profile(userId) })
    },
  })
}

/**
 * Hook to update subscription status
 */
export function useUpdateSubscriptionStatus(userId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (status: 'free' | 'premium' | 'enterprise') => {
      if (!userId) throw new Error('User ID is required')
      
      const response = await profileService.updateSubscriptionStatus(userId, status)
      if (response.error) throw response.error
      
      return response.data
    },
    onSuccess: (data) => {
      if (!userId || !data) return

      // Update profile cache
      queryClient.setQueryData(profileQueryKeys.profile(userId), data)
    },
    onError: (error) => {
      console.error('Subscription status update failed:', error)
    },
  })
}

/**
 * Hook to delete therapist profile
 */
export function useDeleteProfile(userId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID is required')
      
      const response = await profileService.deleteProfile(userId)
      if (response.error) throw response.error
      
      return true
    },
    onSuccess: () => {
      if (!userId) return

      // Remove from cache
      queryClient.setQueryData(profileQueryKeys.profile(userId), null)
      queryClient.setQueryData(profileQueryKeys.hasProfile(userId), false)
      
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.all
      })
    },
    onError: (error) => {
      console.error('Profile deletion failed:', error)
    },
  })
}

/**
 * Utility hook to prefetch profile data
 */
export function usePrefetchProfile() {
  const queryClient = useQueryClient()

  return (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: profileQueryKeys.profile(userId),
      queryFn: async () => {
        const response = await profileService.getProfile(userId)
        if (response.error) throw response.error
        return response.data
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }
}