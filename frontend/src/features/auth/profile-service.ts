// ABOUTME: Profile service for CRUD operations on therapist profiles
// ABOUTME: Handles API calls to Supabase for therapist profile management

import { supabase } from '../../lib/supabase'
import type { 
  TherapistProfile, 
  TherapistRow, 
  ProfileData, 
  ProfileUpdateResponse, 
  ProfileApiError 
} from './auth-types'

export class ProfileService {
  /**
   * Get therapist profile by user ID
   */
  async getProfile(userId: string): Promise<ProfileUpdateResponse> {
    try {
      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found - this is expected for new users
          return { data: null, error: null }
        }
        
        const profileError: ProfileApiError = new Error(error.message) as ProfileApiError
        profileError.status = error.code === 'PGRST301' ? 403 : 500
        profileError.code = error.code
        return { data: null, error: profileError }
      }

      const profile: TherapistProfile = {
        id: data.id,
        profile: data.profile || {},
        subscription_status: data.subscription_status as 'free' | 'premium' | 'enterprise',
        created_at: data.created_at,
        updated_at: data.updated_at,
      }

      return { data: profile, error: null }
    } catch (error) {
      const profileError: ProfileApiError = new Error('Network error occurred') as ProfileApiError
      profileError.status = 0
      return { data: null, error: profileError }
    }
  }

  /**
   * Create or update therapist profile
   */
  async upsertProfile(userId: string, profileData: Partial<ProfileData>): Promise<ProfileUpdateResponse> {
    try {
      const { data, error } = await supabase
        .from('therapists')
        .upsert(
          {
            id: userId,
            profile: profileData,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'id',
            ignoreDuplicates: false,
          }
        )
        .select()
        .single()

      if (error) {
        const profileError: ProfileApiError = new Error(error.message) as ProfileApiError
        profileError.status = error.code === 'PGRST301' ? 403 : 500
        profileError.code = error.code
        return { data: null, error: profileError }
      }

      const profile: TherapistProfile = {
        id: data.id,
        profile: data.profile || {},
        subscription_status: data.subscription_status as 'free' | 'premium' | 'enterprise',
        created_at: data.created_at,
        updated_at: data.updated_at,
      }

      return { data: profile, error: null }
    } catch (error) {
      const profileError: ProfileApiError = new Error('Network error occurred') as ProfileApiError
      profileError.status = 0
      return { data: null, error: profileError }
    }
  }

  /**
   * Update specific profile fields
   */
  async updateProfile(userId: string, updates: Partial<ProfileData>): Promise<ProfileUpdateResponse> {
    try {
      // First get the current profile
      const currentProfileResponse = await this.getProfile(userId)
      if (currentProfileResponse.error) {
        return currentProfileResponse
      }

      // Merge updates with current profile data
      const currentProfile = currentProfileResponse.data?.profile || {}
      const updatedProfile = { ...currentProfile, ...updates }

      return await this.upsertProfile(userId, updatedProfile)
    } catch (error) {
      const profileError: ProfileApiError = new Error('Failed to update profile') as ProfileApiError
      profileError.status = 0
      return { data: null, error: profileError }
    }
  }

  /**
   * Delete therapist profile (soft delete - keeps user record)
   */
  async deleteProfile(userId: string): Promise<{ error: ProfileApiError | null }> {
    try {
      const { error } = await supabase
        .from('therapists')
        .delete()
        .eq('id', userId)

      if (error) {
        const profileError: ProfileApiError = new Error(error.message) as ProfileApiError
        profileError.status = error.code === 'PGRST301' ? 403 : 500
        profileError.code = error.code
        return { error: profileError }
      }

      return { error: null }
    } catch (error) {
      const profileError: ProfileApiError = new Error('Network error occurred') as ProfileApiError
      profileError.status = 0
      return { error: profileError }
    }
  }

  /**
   * Check if user has a profile
   */
  async hasProfile(userId: string): Promise<{ hasProfile: boolean; error: ProfileApiError | null }> {
    try {
      const { data, error } = await supabase
        .from('therapists')
        .select('id')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found
          return { hasProfile: false, error: null }
        }
        
        const profileError: ProfileApiError = new Error(error.message) as ProfileApiError
        profileError.status = error.code === 'PGRST301' ? 403 : 500
        profileError.code = error.code
        return { hasProfile: false, error: profileError }
      }

      return { hasProfile: !!data, error: null }
    } catch (error) {
      const profileError: ProfileApiError = new Error('Network error occurred') as ProfileApiError
      profileError.status = 0
      return { hasProfile: false, error: profileError }
    }
  }

  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(
    userId: string, 
    status: 'free' | 'premium' | 'enterprise'
  ): Promise<ProfileUpdateResponse> {
    try {
      const { data, error } = await supabase
        .from('therapists')
        .update({
          subscription_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        const profileError: ProfileApiError = new Error(error.message) as ProfileApiError
        profileError.status = error.code === 'PGRST301' ? 403 : 500
        profileError.code = error.code
        return { data: null, error: profileError }
      }

      const profile: TherapistProfile = {
        id: data.id,
        profile: data.profile || {},
        subscription_status: data.subscription_status as 'free' | 'premium' | 'enterprise',
        created_at: data.created_at,
        updated_at: data.updated_at,
      }

      return { data: profile, error: null }
    } catch (error) {
      const profileError: ProfileApiError = new Error('Network error occurred') as ProfileApiError
      profileError.status = 0
      return { data: null, error: profileError }
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService()