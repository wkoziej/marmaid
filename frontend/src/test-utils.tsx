import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { AuthProvider } from './features/auth/auth-context'

// Custom render function with all necessary providers (for component testing)
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MemoryRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </MemoryRouter>
  )
}

// Custom render function that includes providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Custom render for auth-only contexts (no router needed)
const AuthOnlyProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

const authOnlyRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AuthOnlyProvider, ...options })

// Custom render with Memory Router for testing routing behavior
const RouterProvider = ({ children, initialEntries = ['/'] }: { 
  children: React.ReactNode
  initialEntries?: string[]
}) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </MemoryRouter>
  )
}

const renderWithRouter = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialEntries?: string[] }
) => {
  const { initialEntries, ...renderOptions } = options || {}
  return render(ui, { 
    wrapper: ({ children }) => (
      <RouterProvider initialEntries={initialEntries}>
        {children}
      </RouterProvider>
    ), 
    ...renderOptions 
  })
}

// Re-export everything from testing-library/react
export * from '@testing-library/react'

// Override the default render with our custom render
export { 
  customRender as render, 
  authOnlyRender, 
  renderWithRouter 
}

// Export types
export type { RenderOptions }