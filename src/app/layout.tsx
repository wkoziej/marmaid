// ABOUTME: Application layout wrapper component that provides consistent layout structure for all pages
// ABOUTME: Uses React Router Outlet to render child routes and includes navigation and main content areas

import { Outlet } from 'react-router-dom';
import { Navigation } from '../components/navigation';

export const Layout = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
      <nav
        className='bg-white border-b border-gray-200 px-4 py-3'
        data-testid='main-navigation'
      >
        <div className='flex items-center justify-between max-w-7xl mx-auto'>
          <div className='flex items-center space-x-4'>
            <h1 className='text-xl font-semibold text-gray-900'>Marmaid</h1>
          </div>
          <Navigation />
        </div>
      </nav>

      <main className='max-w-7xl mx-auto px-4 py-6' data-testid='main-content'>
        <Outlet />
      </main>
    </div>
  );
};
