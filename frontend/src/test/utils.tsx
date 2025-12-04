import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'

interface WrapperProps {
  children: ReactNode
}

// Wrapper with all providers
const AllProviders = ({ children }: WrapperProps) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  )
}

// Router only wrapper (for testing components without auth)
const RouterWrapper = ({ children }: WrapperProps) => {
  return <BrowserRouter>{children}</BrowserRouter>
}

// Custom render with all providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options })

// Render with just router (no auth)
const renderWithRouter = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: RouterWrapper, ...options })

// Re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render, renderWithRouter }
