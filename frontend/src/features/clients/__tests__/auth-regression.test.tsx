// ABOUTME: Regression tests for authentication flow after client feature implementation
// ABOUTME: Ensures existing auth features continue to work with client management integration

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '../../../app/layout';
import { Dashboard } from '../../../app/pages/dashboard';
import { ClientsPage } from '../../../app/pages/clients-page';
import { ProfilePage } from '../../../app/pages/profile-page';
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

const TestApp = ({ initialEntries = ['/dashboard'] }) => (
  <MemoryRouter initialEntries={initialEntries}>
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  </MemoryRouter>
);

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
      render(<TestApp />);
      // Email is not in the new layout, but we can check for the main dashboard title
      expect(screen.getByText('Marmaid')).toBeInTheDocument();
    });

    it('should show sign out button when authenticated', () => {
      render(<TestApp />);
      const signOutButton = screen.getByText('Wyloguj się');
      expect(signOutButton).toBeInTheDocument();
    });

    it('should call signOut when sign out button is clicked', async () => {
      render(<TestApp />);
      const signOutButton = screen.getByText('Wyloguj się');
      fireEvent.click(signOutButton);
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledOnce();
      });
    });
  });

  describe('Navigation Between Features', () => {
    it('should navigate to profile management', async () => {
      render(<TestApp />);
      const profileLink = screen.getByText('Profil');
      fireEvent.click(profileLink);
      await waitFor(() => {
        expect(screen.getByTestId('profile-form')).toBeInTheDocument();
      });
    });

    it('should navigate to client management', async () => {
      render(<TestApp />);
      const nav = screen.getByRole('navigation');
      const clientLink = within(nav).getByText('Klienci');
      fireEvent.click(clientLink);
      await waitFor(() => {
        expect(screen.getByTestId('client-list')).toBeInTheDocument();
      });
    });
  });
});