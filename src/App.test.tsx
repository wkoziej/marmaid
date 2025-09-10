import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Mock git info for tests
declare global {
  var __GIT_INFO__: {
    commit: string
    branch: string
    date: string
  }
}

beforeEach(() => {
  global.__GIT_INFO__ = {
    commit: 'abc123',
    branch: 'test-branch',
    date: '2025-09-10'
  }
})

describe('App', () => {
  it('renders Marmaid title', () => {
    render(<App />)
    expect(screen.getByTestId('app-title')).toHaveTextContent('Marmaid')
  })

  it('displays git information', () => {
    render(<App />)
    expect(screen.getByTestId('version-display')).toHaveTextContent('Version: abc123')
    expect(screen.getByTestId('environment-display')).toHaveTextContent('Environment: Development')
    expect(screen.getByTestId('branch-display')).toHaveTextContent('Branch: test-branch')
    expect(screen.getByTestId('build-date-display')).toHaveTextContent('Built: 2025-09-10')
  })

  it('displays database information', () => {
    render(<App />)
    expect(screen.getByTestId('database-display')).toHaveTextContent('Database: Unknown Database')
    expect(screen.getByTestId('database-url-display')).toHaveTextContent('DB URL: http://127.0.0.1:54321')
  })

  it('shows link to application', () => {
    render(<App />)
    const link = screen.getByTestId('app-navigation-link')
    expect(link).toHaveTextContent('Go to Application →')
    expect(link).toHaveAttribute('href', '/frontend')
  })

  it('displays description', () => {
    render(<App />)
    expect(screen.getByTestId('app-description')).toHaveTextContent('Visualization tool for Marma points for therapists')
  })

  it('shows correct environment for different branches', () => {
    // Test main branch
    global.__GIT_INFO__ = { commit: 'abc123', branch: 'main', date: '2025-09-10' }
    render(<App />)
    expect(screen.getByTestId('environment-display')).toHaveTextContent('Environment: Production')
  })

  it('shows test environment for test branch', () => {
    // Test test branch  
    global.__GIT_INFO__ = { commit: 'abc123', branch: 'test', date: '2025-09-10' }
    render(<App />)
    expect(screen.getByTestId('environment-display')).toHaveTextContent('Environment: Test')
  })
})