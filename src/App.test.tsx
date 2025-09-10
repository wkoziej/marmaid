import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
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
  vi.unstubAllGlobals()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
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
    
    // Check that database info is displayed (content will vary by environment)
    expect(screen.getByTestId('database-display')).toBeInTheDocument()
    expect(screen.getByTestId('database-url-display')).toBeInTheDocument()
    
    // In CI, we expect either Local Development or Test Database
    const databaseText = screen.getByTestId('database-display').textContent
    expect(databaseText).toMatch(/Database: (Local Development|Test Database|Unknown Database)/)
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