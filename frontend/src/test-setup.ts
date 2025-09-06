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

  // Don't mock Supabase for integration tests - but mock other services
  vi.mock('./lib/audit', () => ({
    auditService: {
      logDataAccess: vi.fn().mockResolvedValue(true),
      logDataModify: vi.fn().mockResolvedValue(true),
    }
  }))

  vi.mock('./lib/encryption', () => ({
    encryptionService: {
      encryptData: vi.fn().mockResolvedValue({
        data: 'integration-encrypted-data',
        iv: 'test-iv',
        salt: 'test-salt',
        timestamp: new Date().toISOString(),
        version: '1.0'
      }),
      decryptData: vi.fn().mockResolvedValue('integration-decrypted-data'),
      generateUserKey: vi.fn().mockReturnValue('integration-user-key'),
      validateEncryptedData: vi.fn().mockReturnValue(false),
    }
  }))

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
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } }
        })),
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn(),
        or: vi.fn().mockReturnThis(),
        overlaps: vi.fn().mockReturnThis(),
      })),
    }
  }))

  // Mock audit service
  vi.mock('./lib/audit', () => ({
    auditService: {
      logDataAccess: vi.fn().mockResolvedValue(true),
      logDataModify: vi.fn().mockResolvedValue(true),
    }
  }))

  // Mock encryption service  
  vi.mock('./lib/encryption', () => ({
    encryptionService: {
      encryptData: vi.fn().mockResolvedValue({
        data: 'unit-test-encrypted-data',
        iv: 'mock-iv',
        salt: 'mock-salt',
        timestamp: new Date().toISOString(),
        version: '1.0'
      }),
      decryptData: vi.fn().mockResolvedValue('unit-test-decrypted-data'),
      generateUserKey: vi.fn().mockReturnValue('unit-test-user-key'),
      validateEncryptedData: vi.fn().mockReturnValue(false),
    }
  }))
}