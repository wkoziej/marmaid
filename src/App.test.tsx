import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders Marmaid title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Marmaid' })).toBeInTheDocument()
  })

  it('displays version information', () => {
    render(<App />)
    expect(screen.getByText('Version: 1.0.0')).toBeInTheDocument()
    expect(screen.getByText('Status: Development')).toBeInTheDocument()
  })

  it('shows link to application', () => {
    render(<App />)
    const link = screen.getByRole('link', { name: 'Go to Application →' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/frontend')
  })

  it('displays description', () => {
    render(<App />)
    expect(screen.getByText('Visualization tool for Marma points for therapists')).toBeInTheDocument()
  })
})