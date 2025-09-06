// ABOUTME: Regression tests for authentication flow after client feature implementation
// ABOUTME: Ensures existing auth features continue to work with client management integration

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Dashboard } from '../../../app/pages/dashboard';
import { useAuth } from '../../auth/use-auth';

// Mock the auth hook
vi.mock('../../auth/use-auth', () => ({
  useAuth: vi.fn(),
}));

// Mock client components
vi.mock('../components/ClientList', () => ({
  ClientList: () => <div data-testid="client-list">Client List Component</div>,
}));

// Mock ProfileForm
vi.mock('../../auth/ProfileForm', () => ({
  ProfileForm: ({ onSuccess, onCancel }: any) => (
    <div data-testid="profile-form">
      <button onClick={onSuccess}>Save Profile</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('Authentication Regression Tests', () => {
  const mockSignOut = vi.fn();
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00.000Z',
    user_metadata: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    (useAuth as any).mockReturnValue({
      user: mockUser,
      signOut: mockSignOut,
      loading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Dashboard Authentication State', () => {
    it('should display user email when authenticated', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should show sign out button when authenticated', () => {
      render(<Dashboard />);
      
      const signOutButton = screen.getByText('Wyloguj się');
      expect(signOutButton).toBeInTheDocument();
    });

    it('should call signOut when sign out button is clicked', async () => {
      render(<Dashboard />);
      
      const signOutButton = screen.getByText('Wyloguj się');
      fireEvent.click(signOutButton);
      
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledOnce();
      });
    });
  });

  describe('Navigation Between Features', () => {
    it('should navigate to profile management', async () => {
      render(<Dashboard />);
      
      // Click on profile management button
      const profileButton = screen.getByText('Zarządzaj profilem');
      fireEvent.click(profileButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('profile-form')).toBeInTheDocument();
      });
    });

    it('should navigate back to dashboard from profile', async () => {
      render(<Dashboard />);
      
      // Navigate to profile
      const profileButton = screen.getByText('Zarządzaj profilem');
      fireEvent.click(profileButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('profile-form')).toBeInTheDocument();
      });
      
      // Navigate back
      const backButton = screen.getByText('Powrót do Dashboard');
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument();
        expect(screen.queryByTestId('profile-form')).not.toBeInTheDocument();
      });
    });

    it('should navigate to client management', async () => {
      render(<Dashboard />);
      
      // Click on client management button
      const clientButton = screen.getByText('Zarządzaj klientami');
      fireEvent.click(clientButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('client-list')).toBeInTheDocument();
        expect(screen.getByText('Zarządzanie klientami')).toBeInTheDocument();
      });
    });

    it('should navigate back to dashboard from client management', async () => {
      render(<Dashboard />);
      
      // Navigate to clients
      const clientButton = screen.getByText('Zarządzaj klientami');
      fireEvent.click(clientButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('client-list')).toBeInTheDocument();
      });
      
      // Navigate back
      const backButton = screen.getByText('Powrót do Dashboard');
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument();
        expect(screen.queryByTestId('client-list')).not.toBeInTheDocument();
      });
    });
  });

  describe('Authentication Context Preservation', () => {
    it('should preserve authentication state across navigation', async () => {
      render(<Dashboard />);
      
      // Verify auth state by checking if authenticated elements are present
      expect(screen.getByText('Wyloguj się')).toBeInTheDocument();
      
      // Navigate to profile
      const profileButton = screen.getByText('Zarządzaj profilem');
      fireEvent.click(profileButton);
      
      await waitFor(() => {
        expect(screen.getByText('Profil terapeuty')).toBeInTheDocument();
        // Auth state preserved - logout button still exists
        expect(screen.getByText('Wyloguj się')).toBeInTheDocument();
      });
      
      // Navigate back
      const backButton = screen.getByText('Powrót do Dashboard');
      fireEvent.click(backButton);
      
      const clientButton = screen.getByText('Zarządzaj klientami');
      fireEvent.click(clientButton);
      
      await waitFor(() => {
        expect(screen.getByText('Zarządzanie klientami')).toBeInTheDocument();
        // Auth state preserved - logout button still exists
        expect(screen.getByText('Wyloguj się')).toBeInTheDocument();
      });
    });

    it('should maintain sign out functionality across all views', async () => {
      render(<Dashboard />);
      
      // Test sign out from dashboard
      let signOutButton = screen.getByText('Wyloguj się');
      expect(signOutButton).toBeInTheDocument();
      
      // Navigate to profile
      const profileButton = screen.getByText('Zarządzaj profilem');
      fireEvent.click(profileButton);
      
      await waitFor(() => {
        signOutButton = screen.getByText('Wyloguj się');
        expect(signOutButton).toBeInTheDocument();
      });
      
      fireEvent.click(signOutButton);
      expect(mockSignOut).toHaveBeenCalledOnce();
      
      // Navigate back and to clients
      const backButton = screen.getByText('Powrót do Dashboard');
      fireEvent.click(backButton);
      
      const clientButton = screen.getByText('Zarządzaj klientami');
      fireEvent.click(clientButton);
      
      await waitFor(() => {
        signOutButton = screen.getByText('Wyloguj się');
        expect(signOutButton).toBeInTheDocument();
      });
      
      fireEvent.click(signOutButton);
      expect(mockSignOut).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle authentication errors gracefully', () => {
      (useAuth as any).mockReturnValue({
        user: null,
        signOut: mockSignOut,
        loading: false,
        error: 'Authentication failed',
      });

      // This would typically redirect to login, but we're testing dashboard specifically
      // The auth wrapper should handle the redirect
      render(<Dashboard />);
      
      // The component should still render without crashing
      expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument();
    });

    it('should handle loading states properly', () => {
      (useAuth as any).mockReturnValue({
        user: null,
        signOut: mockSignOut,
        loading: true,
        error: null,
      });

      render(<Dashboard />);
      
      // Component should render without user email during loading
      expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
      expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument();
    });
  });

  describe('UI Component Integration', () => {
    it('should maintain consistent header across all views', async () => {
      render(<Dashboard />);
      
      // Check dashboard header
      expect(screen.getByText('Marmaid Dashboard')).toBeInTheDocument();
      
      // Navigate to profile - header should change
      const profileButton = screen.getByText('Zarządzaj profilem');
      fireEvent.click(profileButton);
      
      await waitFor(() => {
        expect(screen.getByText('Profil terapeuty')).toBeInTheDocument();
        expect(screen.queryByText('Marmaid Dashboard')).not.toBeInTheDocument();
      });
      
      // Navigate back
      const backButton = screen.getByText('Powrót do Dashboard');
      fireEvent.click(backButton);
      
      // Navigate to clients - header should change again
      const clientButton = screen.getByText('Zarządzaj klientami');
      fireEvent.click(clientButton);
      
      await waitFor(() => {
        expect(screen.getByText('Zarządzanie klientami')).toBeInTheDocument();
        expect(screen.queryByText('Marmaid Dashboard')).not.toBeInTheDocument();
      });
    });

    it('should maintain button styling and functionality', () => {
      render(<Dashboard />);
      
      // Check that all main buttons exist
      expect(screen.getByText('Zarządzaj klientami')).toBeInTheDocument();
      expect(screen.getByText('Zarządzaj profilem')).toBeInTheDocument();
      expect(screen.getByText('Wyloguj się')).toBeInTheDocument();
      
      // Test that sign out works
      const signOutButton = screen.getByText('Wyloguj się');
      fireEvent.click(signOutButton);
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});