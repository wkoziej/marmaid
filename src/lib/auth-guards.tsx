// ABOUTME: Route protection utilities for authentication-required routes with redirect functionality
// ABOUTME: Provides ProtectedRoute component and authentication checking utilities for React Router

import { ReactNode, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import { User } from './types';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: Array<'therapist' | 'client'>;
}

// Hook to get current authentication state
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  // This is a simplified version - in a real app, you'd use context or state management
  // For now, we'll check Supabase session
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Convert Supabase user to our User type
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role:
            (session.user.user_metadata?.role as 'therapist' | 'client') ||
            'therapist', // Get role from user metadata, default to therapist
          createdAt: session.user.created_at || '',
          updatedAt: session.user.updated_at || '',
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role:
            (session.user.user_metadata?.role as 'therapist' | 'client') ||
            'therapist',
          createdAt: session.user.created_at || '',
          updatedAt: session.user.updated_at || '',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
};

// Protected Route component
export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div
        className='flex items-center justify-center min-h-screen'
        data-testid='auth-loading'
      >
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to='/login' state={{ from: location.pathname }} replace />;
  }

  // Check role permissions if roles are specified
  if (roles && !roles.includes(user.role)) {
    return (
      <div
        className='flex items-center justify-center min-h-screen'
        data-testid='auth-unauthorized'
      >
        <div className='text-center'>
          <h2 className='text-xl font-semibold mb-2'>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Utility function to check if user is authenticated
// eslint-disable-next-line react-refresh/only-export-components
export const isAuthenticated = async (): Promise<boolean> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session?.user;
};

// Utility function to get current user
// eslint-disable-next-line react-refresh/only-export-components
export const getCurrentUser = async (): Promise<User | null> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email || '',
    role:
      (session.user.user_metadata?.role as 'therapist' | 'client') ||
      'therapist',
    createdAt: session.user.created_at || '',
    updatedAt: session.user.updated_at || '',
  };
};
