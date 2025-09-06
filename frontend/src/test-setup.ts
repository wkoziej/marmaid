// ABOUTME: Intelligent test setup - mocks Supabase for unit tests, uses real for integration
// ABOUTME: Detects test type and configures environment accordingly

import '@testing-library/jest-dom'

// Check test environment and type
const isIntegrationTest = process.env.VITEST_TEST_TYPE === 'integration'
const hasSupabaseEnv = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

console.log(`🧪 Test setup: ${isIntegrationTest ? 'Integration' : 'Unit'} mode`)

if (isIntegrationTest) {
  // Integration tests - only mock non-Supabase services
  console.log('🌐 Integration mode: Using real Supabase when available')
  
  if (hasSupabaseEnv) {
    console.log(`   Supabase URL: ${import.meta.env.VITE_SUPABASE_URL}`)
  } else {
    console.warn('⚠️  No Supabase environment found - integration tests will be skipped')
  }

  // Don't mock Supabase for integration tests 
  // Individual test files handle their own audit/encryption service mocking

  // Longer timeout for integration tests
  vi.setConfig({
    testTimeout: 30000,
  })
  
} else {
  // Unit tests - mock everything including Supabase
  console.log('🔧 Unit mode: All services mocked')
  
  // Mock Supabase completely for unit tests
  vi.mock('./lib/supabase', () => ({
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null
        }),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } }
        })),
        signUp: vi.fn().mockResolvedValue({ error: null }),
        signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        or: vi.fn().mockReturnThis(),
        overlaps: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null }))
      })),
    }
  }))

  // Individual test files handle their own audit/encryption service mocking
  // Only mock Supabase globally for unit tests
}