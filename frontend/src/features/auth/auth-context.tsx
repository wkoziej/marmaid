import React, { useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { AuthContext, type AuthContextType } from './auth-types'
import { securityService } from './services/securityService'
import { auditService } from '../../lib/audit'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize security service
    securityService.initializeSecurity({
      sessionTimeoutMinutes: 60,
      maxInactiveMinutes: 30,
      refreshThresholdMinutes: 5,
      enableSessionMonitoring: true,
      enableSecurityHeaders: true,
    })

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Initialize audit service when session is available
      if (session?.user) {
        auditService.initialize()
      }
    })

    // Listen for auth changes with enhanced security
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle security and audit events
        if (session?.user && event === 'SIGNED_IN') {
          auditService.initialize()
          await auditService.logAuth('sign_in', true, {
            provider: session.user.app_metadata?.provider || 'email',
            event_type: event
          })
        } else if (event === 'SIGNED_OUT') {
          await auditService.logAuth('sign_out', true, {
            event_type: event
          })
          // Clear sensitive data on logout
          localStorage.removeItem('session_monitoring')
          sessionStorage.clear()
        }
      }
    )

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe()
      securityService.cleanup()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    const result = await supabase.auth.signUp({
      email,
      password,
    })
    
    // Log sign up attempt
    await auditService.logAuth('sign_up_attempt', !result.error, {
      email,
      error: result.error?.message
    })
    
    return { error: result.error }
  }

  const signIn = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    // Log sign in attempt
    await auditService.logAuth('sign_in_attempt', !result.error, {
      email,
      error: result.error?.message
    })
    
    return { error: result.error }
  }

  const signOut = async () => {
    // Log sign out attempt
    await auditService.logAuth('sign_out_attempt', true)
    
    await supabase.auth.signOut()
  }

  // Security functions
  const getSessionStatus = async () => {
    return securityService.getSessionStatus()
  }

  const getSecurityAlerts = () => {
    return securityService.getSecurityAlerts()
  }

  const getSessionMonitoringData = () => {
    return securityService.getSessionMonitoringData()
  }

  const refreshSession = async () => {
    return securityService.forceRefresh()
  }

  const isSessionValid = async () => {
    return securityService.isSessionValid()
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    getSessionStatus,
    getSecurityAlerts,
    getSessionMonitoringData,
    refreshSession,
    isSessionValid,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Re-export useAuth hook
export { useAuth } from './use-auth'

