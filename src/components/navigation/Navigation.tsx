// ABOUTME: Basic navigation component using React Router Link for proper SPA navigation
// ABOUTME: Provides navigation links with active state styling and proper routing behavior

import { Link, useLocation } from 'react-router-dom';

export const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-blue-100 text-blue-900'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`;

  return (
    <nav className='flex items-center space-x-4' data-testid='navigation'>
      <Link to='/' className={linkClass('/')} data-testid='nav-home-link'>
        Home
      </Link>
      <Link
        to='/login'
        className={linkClass('/login')}
        data-testid='nav-login-link'
      >
        Login
      </Link>
      <Link
        to='/dashboard'
        className={linkClass('/dashboard')}
        data-testid='nav-dashboard-link'
      >
        Dashboard
      </Link>
    </nav>
  );
};
