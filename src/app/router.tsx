// ABOUTME: React Router v6 configuration with basic route structure for the application
// ABOUTME: Includes public routes (/, /login) and protected routes (/dashboard) with authentication guards

import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './layout';
import { ProtectedRoute } from '../lib/auth-guards';
import App from '../App';

// Temporary components until feature modules are implemented
// eslint-disable-next-line react-refresh/only-export-components
const LoginPage = () => (
  <div data-testid='login-page'>
    <h1>Login Page</h1>
    <p>Login functionality will be implemented in auth feature module</p>
  </div>
);

// eslint-disable-next-line react-refresh/only-export-components
const Dashboard = () => (
  <div data-testid='dashboard-page'>
    <h1>Dashboard</h1>
    <p>Dashboard functionality will be implemented</p>
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
        element: <LoginPage />,
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
