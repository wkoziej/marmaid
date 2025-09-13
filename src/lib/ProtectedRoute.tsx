// ABOUTME: Protected route component using Zustand store for authentication
// ABOUTME: Provides route protection with role-based access control and loading states
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './auth-store';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: Array<'therapist' | 'client'>;
}

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated, initialize } = useAuthStore();
  const location = useLocation();

  // Initialize auth store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div
        className='flex items-center justify-center min-h-screen bg-background'
        data-testid='auth-loading'
      >
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to='/login' state={{ from: location.pathname }} replace />;
  }

  // Check role permissions if roles are specified
  if (roles && !roles.includes(user.role)) {
    return (
      <div
        className='flex items-center justify-center min-h-screen bg-background'
        data-testid='auth-unauthorized'
      >
        <div className='text-center'>
          <h2 className='text-xl font-semibold mb-2'>Access Denied</h2>
          <p className='text-muted-foreground'>
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
