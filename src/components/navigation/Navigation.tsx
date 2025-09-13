// ABOUTME: Smart navigation component with authentication-aware link visibility
// ABOUTME: Shows different navigation options based on user authentication status with logout functionality

import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';

export const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-blue-100 text-blue-900'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className='flex items-center space-x-4' data-testid='navigation'>
      <Link to='/' className={linkClass('/')} data-testid='nav-home-link'>
        Home
      </Link>

      {user ? (
        // Authenticated user navigation
        <>
          <Link
            to='/dashboard'
            className={linkClass('/dashboard')}
            data-testid='nav-dashboard-link'
          >
            Dashboard
          </Link>
          <div className='flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200'>
            <span className='text-sm text-gray-600' data-testid='user-email'>
              {user.email}
            </span>
            <Button
              onClick={handleLogout}
              variant='outline'
              size='sm'
              data-testid='logout-button'
            >
              Logout
            </Button>
          </div>
        </>
      ) : (
        // Unauthenticated user navigation
        <>
          <Link
            to='/login'
            className={linkClass('/login')}
            data-testid='nav-login-link'
          >
            Login
          </Link>
          <Link
            to='/register'
            className={linkClass('/register')}
            data-testid='nav-register-link'
          >
            Register
          </Link>
        </>
      )}
    </nav>
  );
};
