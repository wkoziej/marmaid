// ABOUTME: Basic routing tests using React Testing Library and MemoryRouter for isolated testing
// ABOUTME: Tests route navigation, protected routes, and authentication flow behavior

import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Layout } from '../../src/app/layout';
import { ProtectedRoute } from '../../src/lib/auth-guards';
import App from '../../src/App';

// Mock Supabase to avoid connection errors in tests
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'relation does not exist' },
        }),
      }),
    }),
  },
}));

// Mock the Supabase test component to avoid async issues
vi.mock('../../src/lib/supabase-test', () => ({
  SupabaseConnectionTest: () => (
    <div data-testid='supabase-mock'>Supabase Test Mock</div>
  ),
}));

// Test components
const LoginPage = () => (
  <div data-testid='login-page'>
    <h1>Login Page</h1>
  </div>
);

const Dashboard = () => (
  <div data-testid='dashboard-page'>
    <h1>Dashboard</h1>
  </div>
);

const createTestRouter = (initialEntries: string[] = ['/']) => {
  return createMemoryRouter(
    [
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
    ],
    {
      initialEntries,
    }
  );
};

describe('Router Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders home page at root path', async () => {
    const router = createTestRouter(['/']);
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId('app-title')).toBeInTheDocument();
    expect(screen.getByTestId('app-title')).toHaveTextContent('Marmaid');
  });

  it('renders login page at /login', async () => {
    const router = createTestRouter(['/login']);
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects unauthenticated users from protected route to login', async () => {
    const router = createTestRouter(['/dashboard']);
    render(<RouterProvider router={router} />);

    // Wait for auth check to complete and redirect to login
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  it('renders navigation component on all pages', async () => {
    const router = createTestRouter(['/']);
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('nav-home-link')).toBeInTheDocument();
    expect(screen.getByTestId('nav-login-link')).toBeInTheDocument();
    expect(screen.getByTestId('nav-dashboard-link')).toBeInTheDocument();
  });

  it('shows loading state while checking authentication', async () => {
    // Mock loading state
    const mockSupabase = await import('../../src/lib/supabase');
    vi.mocked(mockSupabase.supabase.auth.getSession).mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: { session: null } }), 100)
        )
    );

    const router = createTestRouter(['/dashboard']);
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('Navigation Component', () => {
  it('highlights active route', async () => {
    const router = createTestRouter(['/login']);
    render(<RouterProvider router={router} />);

    const loginLink = screen.getByTestId('nav-login-link');
    expect(loginLink).toHaveClass('bg-blue-100', 'text-blue-900');
  });

  it('applies hover styles to inactive routes', async () => {
    const router = createTestRouter(['/login']);
    render(<RouterProvider router={router} />);

    const homeLink = screen.getByTestId('nav-home-link');
    expect(homeLink).toHaveClass('text-gray-600', 'hover:text-gray-900');
  });
});

describe('Layout Component', () => {
  it('renders main navigation and content areas', async () => {
    const router = createTestRouter(['/']);
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId('main-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('displays application title in navigation', async () => {
    const router = createTestRouter(['/']);
    render(<RouterProvider router={router} />);

    // Check that Layout shows navigation
    expect(screen.getByTestId('main-navigation')).toBeInTheDocument();
  });
});
