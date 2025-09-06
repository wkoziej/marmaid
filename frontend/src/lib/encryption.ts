/**
 * Client-side encryption utilities for sensitive therapy data
 * 
 * IMPORTANT: This is client-side encryption for additional security layer.
 * All data is also encrypted in transit (TLS) and at rest (Supabase).
 * This provides field-level encryption for extra sensitive notes/data.
 */

// Types for encrypted data
export interface EncryptedData {
  data: string // Base64 encoded encrypted data
  iv: string   // Base64 encoded initialization vector
  salt: string // Base64 encoded salt for key derivation
  timestamp: string // When encrypted
  version: string   // Encryption version for future migration
}

export interface EncryptionConfig {
  algorithm: string
  keyLength: number
  ivLength: number
  saltLength: number
  iterations: number
}

class EncryptionService {
  private config: EncryptionConfig = {
    algorithm: 'AES-GCM',
    keyLength: 256,
    ivLength: 12, // 96 bits for GCM
    saltLength: 16, // 128 bits
    iterations: 100000, // PBKDF2 iterations
  }

  private encoder = new TextEncoder()
  private decoder = new TextDecoder()

  /**
   * Check if Web Crypto API is available
   */
  private isWebCryptoAvailable(): boolean {
    return typeof window !== 'undefined' && 
           'crypto' in window && 
           'subtle' in window.crypto
  }

  /**
   * Generate a random salt
   */
  private generateSalt(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(this.config.saltLength))
  }

  /**
   * Generate a random IV
   */
  private generateIV(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(this.config.ivLength))
  }

  /**
   * Derive encryption key from password using PBKDF2
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const passwordBuffer = this.encoder.encode(password)
    
    // Import the password as a key
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    )

    // Derive the encryption key
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.config.iterations,
        hash: 'SHA-256',
      },
      passwordKey,
      {
        name: this.config.algorithm,
        length: this.config.keyLength,
      },
      false,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Encrypt sensitive data with user-derived key
   */
  async encryptData(plaintext: string, userKey: string): Promise<EncryptedData> {
    if (!this.isWebCryptoAvailable()) {
      throw new Error('Web Crypto API not available')
    }

    if (!plaintext || !userKey) {
      throw new Error('Plaintext and user key are required')
    }

    try {
      // Generate salt and IV
      const salt = this.generateSalt()
      const iv = this.generateIV()

      // Derive encryption key
      const key = await this.deriveKey(userKey, salt)

      // Encrypt the data
      const plaintextBuffer = this.encoder.encode(plaintext)
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: this.config.algorithm,
          iv: iv,
        },
        key,
        plaintextBuffer
      )

      // Return encrypted data with metadata
      return {
        data: this.arrayBufferToBase64(encryptedBuffer),
        iv: this.arrayBufferToBase64(iv),
        salt: this.arrayBufferToBase64(salt),
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Encryption failed:', error)
      }
      throw new Error('Failed to encrypt data')
    }
  }

  /**
   * Decrypt sensitive data with user-derived key
   */
  async decryptData(encryptedData: EncryptedData, userKey: string): Promise<string> {
    if (!this.isWebCryptoAvailable()) {
      throw new Error('Web Crypto API not available')
    }

    if (!encryptedData || !userKey) {
      throw new Error('Encrypted data and user key are required')
    }

    try {
      // Convert base64 back to arrays
      const data = this.base64ToArrayBuffer(encryptedData.data)
      const iv = this.base64ToArrayBuffer(encryptedData.iv)
      const salt = this.base64ToArrayBuffer(encryptedData.salt)

      // Derive the same encryption key
      const key = await this.deriveKey(userKey, new Uint8Array(salt))

      // Decrypt the data
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: this.config.algorithm,
          iv: new Uint8Array(iv),
        },
        key,
        data
      )

      return this.decoder.decode(decryptedBuffer)
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Decryption failed:', error)
      }
      throw new Error('Failed to decrypt data - invalid key or corrupted data')
    }
  }

  /**
   * Encrypt multiple fields in an object
   */
  async encryptFields<T extends Record<string, any>>(
    data: T,
    fieldsToEncrypt: (keyof T)[],
    userKey: string
  ): Promise<T & { _encrypted: Record<string, EncryptedData> }> {
    const result = { ...data, _encrypted: {} as Record<string, EncryptedData> }

    for (const field of fieldsToEncrypt) {
      const value = data[field]
      if (value && typeof value === 'string') {
        result._encrypted[field as string] = await this.encryptData(value, userKey)
        // Remove plain text field
        delete result[field]
      }
    }

    return result
  }

  /**
   * Decrypt multiple fields in an object
   */
  async decryptFields<T extends Record<string, any>>(
    data: T & { _encrypted?: Record<string, EncryptedData> },
    fieldsToDecrypt: string[],
    userKey: string
  ): Promise<T> {
    const result = { ...data }

    if (data._encrypted) {
      for (const field of fieldsToDecrypt) {
        const encryptedData = data._encrypted[field]
        if (encryptedData) {
          try {
            result[field as keyof T] = await this.decryptData(encryptedData, userKey) as T[keyof T]
          } catch (error) {
            console.warn(`Failed to decrypt field ${field}:`, error)
            // Keep encrypted data if decryption fails
          }
        }
      }
      
      // Remove encrypted metadata from result
      delete result._encrypted
    }

    return result
  }

  /**
   * Generate a user-specific encryption key from session data
   */
  generateUserKey(userId: string, sessionToken: string): string {
    // Combine user ID and session token for key derivation
    // This ensures key is unique per user and session
    return `${userId}:${sessionToken.substring(0, 32)}`
  }

  /**
   * Check if data is encrypted
   */
  isEncrypted(data: any): data is { _encrypted: Record<string, EncryptedData> } {
    return data !== null && data !== undefined && typeof data === 'object' && '_encrypted' in data
  }

  /**
   * Validate encrypted data structure
   */
  validateEncryptedData(data: any): data is EncryptedData {
    return data !== null && data !== undefined &&
           typeof data === 'object' &&
           typeof data.data === 'string' &&
           typeof data.iv === 'string' &&
           typeof data.salt === 'string' &&
           typeof data.timestamp === 'string' &&
           typeof data.version === 'string'
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  /**
   * Estimate encryption overhead
   */
  getEncryptionOverhead(plaintextLength: number): number {
    // Base64 encoding adds ~33% overhead
    // Plus metadata (IV, salt, timestamps, etc.)
    const encryptedSize = Math.ceil(plaintextLength * 1.33)
    const metadataSize = 200 // Approximate JSON metadata size
    return encryptedSize + metadataSize
  }

  /**
   * Performance benchmark for encryption
   */
  async benchmarkEncryption(sampleText: string = 'Sample therapy note data'): Promise<{
    encryptionTimeMs: number
    decryptionTimeMs: number
    dataSize: number
    encryptedSize: number
  }> {
    const userKey = 'benchmark-key'
    const dataSize = new Blob([sampleText]).size

    // Benchmark encryption
    const encryptStart = performance.now()
    const encrypted = await this.encryptData(sampleText, userKey)
    const encryptEnd = performance.now()

    // Benchmark decryption
    const decryptStart = performance.now()
    await this.decryptData(encrypted, userKey)
    const decryptEnd = performance.now()

    const encryptedSize = new Blob([JSON.stringify(encrypted)]).size

    return {
      encryptionTimeMs: encryptEnd - encryptStart,
      decryptionTimeMs: decryptEnd - decryptStart,
      dataSize,
      encryptedSize
    }
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService() 