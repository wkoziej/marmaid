import type { User, Session, AuthError } from '@supabase/supabase-js'
import { createContext } from 'react'
import type { SecurityAlert, SessionMonitoringData } from './services/securityService'

export interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  // Security features
  getSessionStatus: () => Promise<{
    isValid: boolean
    timeRemaining: number
    inactiveTime: number
    lastActivity: string
  }>
  getSecurityAlerts: () => SecurityAlert[]
  getSessionMonitoringData: () => SessionMonitoringData | null
  refreshSession: () => Promise<boolean>
  isSessionValid: () => Promise<boolean>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Therapist Profile Types for Story 1.2
export interface TherapistProfile {
  id: string
  profile: ProfileData
  subscription_status: 'free' | 'premium' | 'enterprise'
  created_at: string
  updated_at: string
}

export interface ProfileData {
  name?: string
  credentials?: string
  practice_info?: string
  therapy_school_id?: string
  ui_preferences?: {
    theme: 'light' | 'dark' | 'system'
    language: string
  }
}

// Database row type for therapists table
export interface TherapistRow {
  id: string
  profile: ProfileData
  subscription_status: string
  created_at: string
  updated_at: string
}

// API response types
export interface ProfileUpdateResponse {
  data: TherapistProfile | null
  error: Error | null
}

export interface ProfileApiError extends Error {
  status?: number
  code?: string
}