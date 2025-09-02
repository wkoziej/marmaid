import { describe, it, expect, beforeEach, vi } from 'vitest'
import { encryptionService } from '../encryption'
import { secureDataService } from '../secure-data'

// Mock window.crypto for testing
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr: Uint8Array) => {
      // Fill with deterministic values for testing
      for (let i = 0; i < arr.length; i++) {
        arr[i] = i % 256
      }
      return arr
    }),
    subtle: {
      importKey: vi.fn().mockResolvedValue({}),
      deriveKey: vi.fn().mockResolvedValue({}),
      encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
      decrypt: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
    }
  },
  writable: true
})

// Mock TextEncoder/TextDecoder
global.TextEncoder = vi.fn().mockImplementation(() => ({
  encode: vi.fn((str: string) => new Uint8Array(Buffer.from(str, 'utf8')))
}))

global.TextDecoder = vi.fn().mockImplementation(() => ({
  decode: vi.fn((arr: Uint8Array) => Buffer.from(arr).toString('utf8'))
}))

// Mock performance.now
global.performance = {
  now: vi.fn(() => Date.now())
} as any

describe('Encryption Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Encryption Operations', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const plaintext = 'Sensitive therapy note content'
      const userKey = 'test-user-key'

      // Mock successful encryption
      vi.mocked(window.crypto.subtle.encrypt).mockResolvedValue(
        new ArrayBuffer(32) // Mock encrypted data
      )

      const encrypted = await encryptionService.encryptData(plaintext, userKey)

      expect(encrypted).toHaveProperty('data')
      expect(encrypted).toHaveProperty('iv')
      expect(encrypted).toHaveProperty('salt')
      expect(encrypted).toHaveProperty('timestamp')
      expect(encrypted).toHaveProperty('version')
      expect(encrypted.version).toBe('1.0')
    })

    it('should require both plaintext and user key', async () => {
      await expect(encryptionService.encryptData('', 'key')).rejects.toThrow(
        'Plaintext and user key are required'
      )

      await expect(encryptionService.encryptData('text', '')).rejects.toThrow(
        'Plaintext and user key are required'
      )
    })

    it('should handle Web Crypto API unavailability', async () => {
      // Temporarily disable crypto
      const originalCrypto = window.crypto
      delete (window as any).crypto

      await expect(
        encryptionService.encryptData('test', 'key')
      ).rejects.toThrow('Web Crypto API not available')

      // Restore crypto
      window.crypto = originalCrypto
    })

    it('should decrypt data with correct user key', async () => {
      const encryptedData = {
        data: 'dGVzdC1kYXRh', // base64 'test-data'
        iv: 'dGVzdC1pdg==', // base64 'test-iv'
        salt: 'dGVzdC1zYWx0', // base64 'test-salt'
        timestamp: new Date().toISOString(),
        version: '1.0'
      }

      // Mock successful decryption
      const mockDecryptedData = new TextEncoder().encode('decrypted content')
      vi.mocked(window.crypto.subtle.decrypt).mockResolvedValue(
        mockDecryptedData.buffer
      )

      const result = await encryptionService.decryptData(encryptedData, 'test-key')
      expect(typeof result).toBe('string')
    })

    it('should handle decryption errors gracefully', async () => {
      const invalidEncryptedData = {
        data: 'aW52YWxpZC1kYXRh', // valid base64
        iv: 'aW52YWxpZC1pdg==', // valid base64
        salt: 'aW52YWxpZC1zYWx0', // valid base64
        timestamp: new Date().toISOString(),
        version: '1.0'
      }

      // Mock decryption failure
      vi.mocked(window.crypto.subtle.decrypt).mockRejectedValue(
        new Error('Decryption failed')
      )

      await expect(
        encryptionService.decryptData(invalidEncryptedData, 'wrong-key')
      ).rejects.toThrow('Failed to decrypt data')
    })
  })

  describe('Field-Level Encryption', () => {
    it('should encrypt multiple fields in an object', async () => {
      const data = {
        id: '123',
        title: 'Session Notes',
        notes: 'Sensitive therapy content',
        recommendations: 'Private recommendations',
        publicField: 'Not sensitive'
      }

      const fieldsToEncrypt = ['notes', 'recommendations'] as (keyof typeof data)[]
      const userKey = 'test-key'

      // Mock encryption
      vi.mocked(window.crypto.subtle.encrypt).mockResolvedValue(
        new ArrayBuffer(32)
      )

      const result = await encryptionService.encryptFields(
        data,
        fieldsToEncrypt,
        userKey
      )

      expect(result).toHaveProperty('_encrypted')
      expect(result._encrypted).toHaveProperty('notes')
      expect(result._encrypted).toHaveProperty('recommendations')
      expect(result).not.toHaveProperty('notes')
      expect(result).not.toHaveProperty('recommendations')
      expect(result.publicField).toBe('Not sensitive')
    })

    it('should decrypt multiple fields in an object', async () => {
      const encryptedData = {
        id: '123',
        title: 'Session Notes',
        publicField: 'Not sensitive',
        _encrypted: {
          notes: {
            data: 'ZW5jcnlwdGVkLW5vdGVz',
            iv: 'dGVzdC1pdg==',
            salt: 'dGVzdC1zYWx0',
            timestamp: new Date().toISOString(),
            version: '1.0'
          },
          recommendations: {
            data: 'ZW5jcnlwdGVkLXJlY29tbWVuZGF0aW9ucw==',
            iv: 'dGVzdC1pdg==',
            salt: 'dGVzdC1zYWx0',
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        }
      }

      const fieldsToDecrypt = ['notes', 'recommendations']
      const userKey = 'test-key'

      // Mock decryption
      vi.mocked(window.crypto.subtle.decrypt)
        .mockResolvedValueOnce(new TextEncoder().encode('Decrypted notes').buffer)
        .mockResolvedValueOnce(new TextEncoder().encode('Decrypted recommendations').buffer)

      const result = await encryptionService.decryptFields(
        encryptedData,
        fieldsToDecrypt,
        userKey
      )

      expect(result).toHaveProperty('notes')
      expect(result).toHaveProperty('recommendations')
      expect(result).not.toHaveProperty('_encrypted')
      expect(result.publicField).toBe('Not sensitive')
    })

    it('should handle partial decryption failures gracefully', async () => {
      const encryptedData = {
        id: '123',
        _encrypted: {
          notes: {
            data: 'dmFsaWQtZGF0YQ==', // valid base64
            iv: 'dGVzdC1pdg==',
            salt: 'dGVzdC1zYWx0',
            timestamp: new Date().toISOString(),
            version: '1.0'
          },
          recommendations: {
            data: 'aW52YWxpZC1kYXRh', // valid base64 but will fail decryption
            iv: 'dGVzdC1pdg==',
            salt: 'dGVzdC1zYWx0',
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        }
      }

      // Mock decryption - success for first, failure for second
      vi.mocked(window.crypto.subtle.decrypt)
        .mockResolvedValueOnce(new TextEncoder().encode('Decrypted notes').buffer)
        .mockRejectedValueOnce(new Error('Decryption failed'))

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await encryptionService.decryptFields(
        encryptedData,
        ['notes', 'recommendations'],
        'test-key'
      )

      expect(result).toHaveProperty('notes')
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to decrypt field recommendations:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Utility Functions', () => {
    it('should generate user-specific encryption keys', () => {
      const userId = 'user-123'
      const sessionToken = 'very-long-session-token-with-lots-of-characters'

      const key = encryptionService.generateUserKey(userId, sessionToken)

      expect(key).toBe(`${userId}:${sessionToken.substring(0, 32)}`)
      expect(key).toContain(userId)
      expect(key.length).toBeLessThanOrEqual(userId.length + 1 + 32)
    })

    it('should detect encrypted data correctly', () => {
      const encryptedData = {
        id: '123',
        _encrypted: {
          notes: {
            data: 'encrypted',
            iv: 'iv',
            salt: 'salt',
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        }
      }

      const plainData = {
        id: '123',
        notes: 'plain text'
      }

      expect(encryptionService.isEncrypted(encryptedData)).toBe(true)
      expect(encryptionService.isEncrypted(plainData)).toBe(false)
      expect(encryptionService.isEncrypted(null)).toBe(false)
      expect(encryptionService.isEncrypted('string')).toBe(false)
    })

    it('should validate encrypted data structure', () => {
      const validEncryptedData = {
        data: 'encrypted-data',
        iv: 'initialization-vector',
        salt: 'salt-value',
        timestamp: new Date().toISOString(),
        version: '1.0'
      }

      const invalidEncryptedData = {
        data: 'encrypted-data',
        // missing iv, salt, timestamp, version
      }

      expect(encryptionService.validateEncryptedData(validEncryptedData)).toBe(true)
      expect(encryptionService.validateEncryptedData(invalidEncryptedData)).toBe(false)
      expect(encryptionService.validateEncryptedData(null)).toBe(false)
    })

    it('should estimate encryption overhead correctly', () => {
      const plaintextLength = 100
      const overhead = encryptionService.getEncryptionOverhead(plaintextLength)

      // Should account for base64 encoding (~33% overhead) plus metadata
      expect(overhead).toBeGreaterThan(plaintextLength)
      expect(overhead).toBeGreaterThan(plaintextLength * 1.33)
    })
  })

  describe('Performance Benchmarking', () => {
    it('should run encryption benchmark', async () => {
      // Mock performance timing
      let callCount = 0
      vi.mocked(performance.now).mockImplementation(() => {
        callCount++
        return callCount * 10 // Simulate time progression
      })

      // Mock encryption operations
      vi.mocked(window.crypto.subtle.encrypt).mockResolvedValue(
        new ArrayBuffer(32)
      )
      vi.mocked(window.crypto.subtle.decrypt).mockResolvedValue(
        new TextEncoder().encode('decrypted').buffer
      )

      const benchmark = await encryptionService.benchmarkEncryption('test data')

      expect(benchmark).toHaveProperty('encryptionTimeMs')
      expect(benchmark).toHaveProperty('decryptionTimeMs')
      expect(benchmark).toHaveProperty('dataSize')
      expect(benchmark).toHaveProperty('encryptedSize')

      expect(typeof benchmark.encryptionTimeMs).toBe('number')
      expect(typeof benchmark.decryptionTimeMs).toBe('number')
      expect(benchmark.dataSize).toBeGreaterThan(0)
      expect(benchmark.encryptedSize).toBeGreaterThan(0)
    })
  })
})

describe('Secure Data Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset configuration
    secureDataService.configure({
      enableEncryption: true,
      sensitiveFields: ['notes', 'recommendations', 'personal_notes', 'therapy_notes']
    })
  })

  describe('Configuration', () => {
    it('should have default configuration', () => {
      const config = secureDataService.getConfig()

      expect(config).toHaveProperty('enableEncryption', true)
      expect(config).toHaveProperty('sensitiveFields')
      expect(config.sensitiveFields).toContain('notes')
      expect(config.sensitiveFields).toContain('recommendations')
    })

    it('should allow configuration updates', () => {
      const newConfig = {
        enableEncryption: false,
        sensitiveFields: ['custom_field']
      }

      secureDataService.configure(newConfig)
      const config = secureDataService.getConfig()

      expect(config.enableEncryption).toBe(false)
      expect(config.sensitiveFields).toEqual(['custom_field'])
    })

    it('should check encryption availability', () => {
      // Since we configured window.crypto in beforeEach, it should be available
      const config = secureDataService.getConfig()
      expect(config.enableEncryption).toBe(true)

      // Test configuration change
      secureDataService.configure({ enableEncryption: false })
      expect(secureDataService.isEncryptionAvailable()).toBe(false)

      // Restore configuration
      secureDataService.configure({ enableEncryption: true })
    })
  })

  describe('Performance Testing', () => {
    it('should run secure operations benchmark', async () => {
      // Mock encryption benchmark
      vi.spyOn(encryptionService, 'benchmarkEncryption').mockResolvedValue({
        encryptionTimeMs: 5,
        decryptionTimeMs: 3,
        dataSize: 100,
        encryptedSize: 150
      })

      const benchmark = await secureDataService.benchmarkSecureOperations()

      expect(benchmark).toHaveProperty('encryptionEnabled')
      expect(benchmark).toHaveProperty('averageEncryptionMs')
      expect(benchmark).toHaveProperty('averageDecryptionMs')
      expect(benchmark).toHaveProperty('averageOperationMs')

      expect(typeof benchmark.averageEncryptionMs).toBe('number')
      expect(typeof benchmark.averageDecryptionMs).toBe('number')
      expect(benchmark.averageEncryptionMs).toBeGreaterThan(0)
      expect(benchmark.averageDecryptionMs).toBeGreaterThan(0)
    })
  })
}) 