import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock git info for tests
declare global {
  var __GIT_INFO__: {
    commit: string;
    branch: string;
    date: string;
  };
}

beforeEach(() => {
  global.__GIT_INFO__ = {
    commit: 'abc123',
    branch: 'test-branch',
    date: '2025-09-10',
  };
  vi.unstubAllGlobals();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('App', () => {
  it('renders Marmaid title', () => {
    render(<App />);
    expect(screen.getByTestId('app-title')).toHaveTextContent('Marmaid');
  });

  it('displays description', () => {
    render(<App />);
    expect(screen.getByTestId('app-description')).toHaveTextContent(
      'Visualization tool for Marma points for therapists'
    );
  });

  it('displays compact developer info header', () => {
    render(<App />);
    const compactHeader = screen.getByTestId('dev-info-compact-header');
    expect(compactHeader).toBeInTheDocument();
    expect(compactHeader).toHaveTextContent(
      '🔧 DEV: v.abc123 | Development | Local Dev'
    );
  });

  it('shows detailed view is initially hidden', () => {
    render(<App />);
    expect(
      screen.queryByTestId('dev-info-detailed-view')
    ).not.toBeInTheDocument();
  });

  it('toggles detailed view when compact header is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const compactHeader = screen.getByTestId('dev-info-compact-header');

    // Click to expand
    await user.click(compactHeader);
    expect(screen.getByTestId('dev-info-detailed-view')).toBeVisible();

    // Click to collapse
    await user.click(compactHeader);
    expect(
      screen.queryByTestId('dev-info-detailed-view')
    ).not.toBeInTheDocument();
  });

  it('displays git information in detailed view when expanded', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Expand detailed view
    await user.click(screen.getByTestId('dev-info-compact-header'));

    expect(screen.getByTestId('version-display')).toHaveTextContent(
      'Version: abc123'
    );
    expect(screen.getByTestId('environment-display')).toHaveTextContent(
      'Environment: Development'
    );
    expect(screen.getByTestId('branch-display')).toHaveTextContent(
      'Branch: test-branch'
    );
    expect(screen.getByTestId('build-date-display')).toHaveTextContent(
      'Built: 2025-09-10'
    );
  });

  it('displays database information in detailed view when expanded', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Expand detailed view
    await user.click(screen.getByTestId('dev-info-compact-header'));

    // Check that database info is displayed (content will vary by environment)
    expect(screen.getByTestId('database-display')).toBeInTheDocument();
    expect(screen.getByTestId('database-url-display')).toBeInTheDocument();

    // In CI, we expect either Local Development or Test Database
    const databaseText = screen.getByTestId('database-display').textContent;
    expect(databaseText).toMatch(
      /Database: (Local Development|Test Database|Unknown Database)/
    );
  });

  it('toggles with Ctrl+D keyboard shortcut', async () => {
    const user = userEvent.setup();
    render(<App />);

    const container = screen.getByTestId('dev-info-container');
    container.focus();

    // Press Ctrl+D to expand
    await user.keyboard('{Control>}d{/Control}');
    expect(screen.getByTestId('dev-info-detailed-view')).toBeVisible();

    // Press Ctrl+D to collapse
    await user.keyboard('{Control>}d{/Control}');
    expect(
      screen.queryByTestId('dev-info-detailed-view')
    ).not.toBeInTheDocument();
  });

  it('shows correct environment for different branches', async () => {
    const user = userEvent.setup();

    // Test main branch
    global.__GIT_INFO__ = {
      commit: 'abc123',
      branch: 'main',
      date: '2025-09-10',
    };
    render(<App />);

    // Check compact header
    expect(screen.getByTestId('dev-info-compact-header')).toHaveTextContent(
      'Production'
    );

    // Expand and check detailed view
    await user.click(screen.getByTestId('dev-info-compact-header'));
    expect(screen.getByTestId('environment-display')).toHaveTextContent(
      'Environment: Production'
    );
  });

  it('shows test environment for test branch', async () => {
    const user = userEvent.setup();

    // Test test branch
    global.__GIT_INFO__ = {
      commit: 'abc123',
      branch: 'test',
      date: '2025-09-10',
    };
    render(<App />);

    // Check compact header
    expect(screen.getByTestId('dev-info-compact-header')).toHaveTextContent(
      'Test'
    );

    // Expand and check detailed view
    await user.click(screen.getByTestId('dev-info-compact-header'));
    expect(screen.getByTestId('environment-display')).toHaveTextContent(
      'Environment: Test'
    );
  });

  it('shortens long commit hashes in compact view', () => {
    global.__GIT_INFO__ = {
      commit: 'abcdef1234567890',
      branch: 'test',
      date: '2025-09-10',
    };
    render(<App />);

    const compactHeader = screen.getByTestId('dev-info-compact-header');
    expect(compactHeader).toHaveTextContent('v.abcdef1');
  });

  it('handles short commit hashes in compact view', () => {
    global.__GIT_INFO__ = { commit: 'abc', branch: 'test', date: '2025-09-10' };
    render(<App />);

    const compactHeader = screen.getByTestId('dev-info-compact-header');
    expect(compactHeader).toHaveTextContent('v.abc');
  });

  it('shows shortened database info in compact view', () => {
    render(<App />);

    const compactHeader = screen.getByTestId('dev-info-compact-header');
    expect(compactHeader).toHaveTextContent('Local Dev'); // "Local Development" shortened
  });

  // Responsive design tests
  it('maintains compact header visibility on small screens', () => {
    // Mock small screen size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    render(<App />);

    const compactHeader = screen.getByTestId('dev-info-compact-header');
    expect(compactHeader).toBeVisible();
    // Check that fontSize is set (clamp values are computed by browser)
    const style = getComputedStyle(compactHeader);
    expect(style.fontSize).toBeDefined();
  });

  it('ensures detailed view works on mobile viewport', async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    render(<App />);

    // Expand detailed view
    await user.click(screen.getByTestId('dev-info-compact-header'));

    const detailedView = screen.getByTestId('dev-info-detailed-view');
    expect(detailedView).toBeVisible();
  });
});
