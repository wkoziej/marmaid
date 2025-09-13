// ABOUTME: React Router v6 configuration with basic route structure for the application
// ABOUTME: Includes public routes (/, /login) and protected routes (/dashboard) with authentication guards

import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './layout';
import { ProtectedRoute } from '../lib/ProtectedRoute';
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { ForgotPasswordForm } from '../features/auth/components/ForgotPasswordForm';
import { VerifyEmailPage } from '../features/auth/components/VerifyEmailPage';
import App from '../App';

// Temporary Dashboard component - will be replaced by actual dashboard feature
// eslint-disable-next-line react-refresh/only-export-components
const Dashboard = () => (
  <div data-testid='dashboard-page' className='p-8'>
    <h1 className='text-2xl font-bold mb-4'>Dashboard</h1>
    <p className='text-muted-foreground'>
      Welcome to your therapy practice management dashboard
    </p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <App />,
      },
      {
        path: '/login',
        element: <LoginForm />,
      },
      {
        path: '/register',
        element: <RegisterForm />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordForm />,
      },
      {
        path: '/verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
