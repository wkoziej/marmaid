import { supabase } from './supabase'
import { encryptionService } from './encryption'
import type { EncryptedData } from './encryption'
import { auditService } from './audit'
import type { User } from '@supabase/supabase-js'

// Types for secure data operations
export interface SecureDataConfig {
  enableEncryption: boolean
  sensitiveFields: string[]
  compressionThreshold: number // Bytes
  encryptionVersion: string
}

export interface SecureOperationResult<T = any> {
  success: boolean
  data?: T
  error?: string
  encrypted?: boolean
  performance?: {
    operationTimeMs: number
    encryptionTimeMs?: number
    decryptionTimeMs?: number
  }
}

export interface TherapyNote {
  id?: string
  client_id: string
  therapist_id: string
  session_date: string
  notes: string // This will be encrypted
  effectiveness_rating?: number
  recommendations?: string // This will be encrypted
  created_at?: string
  updated_at?: string
}

class SecureDataService {
  private config: SecureDataConfig = {
    enableEncryption: true,
    sensitiveFields: ['notes', 'recommendations', 'personal_notes', 'therapy_notes'],
    compressionThreshold: 1024, // 1KB
    encryptionVersion: '1.0'
  }

  /**
   * Get current user session for encryption key generation
   */
  private async getCurrentSession(): Promise<{ user: User; token: string } | null> {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.user) {
      console.error('No active session for secure operations:', error)
      return null
    }

    return {
      user: session.user,
      token: session.access_token
    }
  }

  /**
   * Generate user-specific encryption key
   */
  private async getUserEncryptionKey(): Promise<string | null> {
    const session = await this.getCurrentSession()
    
    if (!session) {
      return null
    }

    return encryptionService.generateUserKey(session.user.id, session.token)
  }

  /**
   * Securely save therapy note with field-level encryption
   */
  async saveTherapyNote(note: Omit<TherapyNote, 'id' | 'created_at' | 'updated_at'>): Promise<SecureOperationResult<TherapyNote>> {
    const startTime = performance.now()
    
    try {
      const userKey = await this.getUserEncryptionKey()
      
      if (!userKey) {
        return {
          success: false,
          error: 'Authentication required for secure operations'
        }
      }

      let processedNote: any = { ...note }
      let encryptionTime = 0

      // Encrypt sensitive fields if encryption is enabled
      if (this.config.enableEncryption) {
        const encryptStart = performance.now()
        
        const fieldsToEncrypt = this.config.sensitiveFields.filter(field => 
          note[field as keyof typeof note] && typeof note[field as keyof typeof note] === 'string'
        ) as (keyof typeof note)[]

        if (fieldsToEncrypt.length > 0) {
          processedNote = await encryptionService.encryptFields(
            note,
            fieldsToEncrypt,
            userKey
          )
        }

        encryptionTime = performance.now() - encryptStart
      }

      // Save to Supabase
      const { data, error } = await supabase
        .from('therapy_notes')
        .insert(processedNote)
        .select()
        .single()

      if (error) {
        console.error('Failed to save therapy note:', error)
        return {
          success: false,
          error: 'Failed to save therapy note'
        }
      }

      const totalTime = performance.now() - startTime

      // Log audit event for data creation
      await auditService.logDataModify(
        'create',
        'therapy_note',
        data.id || 'unknown',
        {
          client_id: note.client_id,
          encrypted: this.config.enableEncryption && encryptionTime > 0,
          performance_ms: totalTime
        }
      )

      return {
        success: true,
        data: data as TherapyNote,
        encrypted: this.config.enableEncryption && encryptionTime > 0,
        performance: {
          operationTimeMs: totalTime,
          encryptionTimeMs: encryptionTime
        }
      }

    } catch (error) {
      console.error('Secure save operation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Securely retrieve and decrypt therapy note
   */
  async getTherapyNote(noteId: string): Promise<SecureOperationResult<TherapyNote>> {
    const startTime = performance.now()

    try {
      const userKey = await this.getUserEncryptionKey()
      
      if (!userKey) {
        return {
          success: false,
          error: 'Authentication required for secure operations'
        }
      }

      // Retrieve from Supabase
      const { data, error } = await supabase
        .from('therapy_notes')
        .select('*')
        .eq('id', noteId)
        .single()

      if (error) {
        console.error('Failed to retrieve therapy note:', error)
        return {
          success: false,
          error: 'Failed to retrieve therapy note'
        }
      }

      let processedData = data
      let decryptionTime = 0

      // Decrypt sensitive fields if they are encrypted
      if (this.config.enableEncryption && encryptionService.isEncrypted(data)) {
        const decryptStart = performance.now()
        
        processedData = await encryptionService.decryptFields(
          data,
          this.config.sensitiveFields,
          userKey
        )

        decryptionTime = performance.now() - decryptStart
      }

      const totalTime = performance.now() - startTime

      // Log audit event for data access
      await auditService.logDataAccess(
        'read',
        'therapy_note',
        noteId,
        {
          encrypted: decryptionTime > 0,
          performance_ms: totalTime
        }
      )

      return {
        success: true,
        data: processedData as TherapyNote,
        encrypted: decryptionTime > 0,
        performance: {
          operationTimeMs: totalTime,
          decryptionTimeMs: decryptionTime
        }
      }

    } catch (error) {
      console.error('Secure retrieve operation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Securely update therapy note with re-encryption
   */
  async updateTherapyNote(noteId: string, updates: Partial<TherapyNote>): Promise<SecureOperationResult<TherapyNote>> {
    const startTime = performance.now()

    try {
      const userKey = await this.getUserEncryptionKey()
      
      if (!userKey) {
        return {
          success: false,
          error: 'Authentication required for secure operations'
        }
      }

      let processedUpdates: any = { ...updates }
      let encryptionTime = 0

      // Encrypt sensitive fields in updates
      if (this.config.enableEncryption) {
        const encryptStart = performance.now()
        
        const fieldsToEncrypt = this.config.sensitiveFields.filter(field => 
          updates[field as keyof typeof updates] && typeof updates[field as keyof typeof updates] === 'string'
        ) as (keyof typeof updates)[]

        if (fieldsToEncrypt.length > 0) {
          // Get current data to merge with updates
          const currentResult = await this.getTherapyNote(noteId)
          if (!currentResult.success || !currentResult.data) {
            return {
              success: false,
              error: 'Failed to retrieve current note for update'
            }
          }

          // Merge current data with updates
          const mergedData = { ...currentResult.data, ...updates }
          
          // Encrypt the merged data
          processedUpdates = await encryptionService.encryptFields(
            mergedData,
            fieldsToEncrypt,
            userKey
          )

          // Remove non-updated fields from the update object
          for (const key in processedUpdates) {
            if (!(key in updates) && key !== '_encrypted') {
              delete processedUpdates[key]
            }
          }
        }

        encryptionTime = performance.now() - encryptStart
      }

      // Update in Supabase
      const { data, error } = await supabase
        .from('therapy_notes')
        .update(processedUpdates)
        .eq('id', noteId)
        .select()
        .single()

      if (error) {
        console.error('Failed to update therapy note:', error)
        return {
          success: false,
          error: 'Failed to update therapy note'
        }
      }

      const totalTime = performance.now() - startTime

      // Log audit event for data modification
      await auditService.logDataModify(
        'update',
        'therapy_note',
        noteId,
        {
          updated_fields: Object.keys(updates),
          encrypted: this.config.enableEncryption && encryptionTime > 0,
          performance_ms: totalTime
        }
      )

      return {
        success: true,
        data: data as TherapyNote,
        encrypted: this.config.enableEncryption && encryptionTime > 0,
        performance: {
          operationTimeMs: totalTime,
          encryptionTimeMs: encryptionTime
        }
      }

    } catch (error) {
      console.error('Secure update operation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Securely delete therapy note with audit logging
   */
  async deleteTherapyNote(noteId: string): Promise<SecureOperationResult<void>> {
    const startTime = performance.now()

    try {
      // First, get the note for audit logging
      const noteResult = await this.getTherapyNote(noteId)
      
      if (!noteResult.success) {
        return {
          success: false,
          error: 'Failed to retrieve note for deletion'
        }
      }

      // Delete from Supabase
      const { error } = await supabase
        .from('therapy_notes')
        .delete()
        .eq('id', noteId)

      if (error) {
        console.error('Failed to delete therapy note:', error)
        return {
          success: false,
          error: 'Failed to delete therapy note'
        }
      }

      const totalTime = performance.now() - startTime

      // Log audit event for data deletion
      await auditService.logDataModify(
        'delete',
        'therapy_note',
        noteId,
        {
          deleted_at: new Date().toISOString(),
          performance_ms: totalTime
        }
      )

      return {
        success: true,
        performance: {
          operationTimeMs: totalTime
        }
      }

    } catch (error) {
      console.error('Secure delete operation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Bulk operation for multiple therapy notes
   */
  async getTherapyNotes(therapistId: string, clientId?: string): Promise<SecureOperationResult<TherapyNote[]>> {
    const startTime = performance.now()

    try {
      const userKey = await this.getUserEncryptionKey()
      
      if (!userKey) {
        return {
          success: false,
          error: 'Authentication required for secure operations'
        }
      }

      // Build query
      let query = supabase
        .from('therapy_notes')
        .select('*')
        .eq('therapist_id', therapistId)

      if (clientId) {
        query = query.eq('client_id', clientId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to retrieve therapy notes:', error)
        return {
          success: false,
          error: 'Failed to retrieve therapy notes'
        }
      }

      let decryptionTime = 0

      // Decrypt all notes
      const processedNotes: TherapyNote[] = []

      if (this.config.enableEncryption) {
        const decryptStart = performance.now()
        
        for (const note of data) {
          if (encryptionService.isEncrypted(note)) {
                         const decryptedNote = await encryptionService.decryptFields(
               note,
               this.config.sensitiveFields,
               userKey
             )
             processedNotes.push(decryptedNote as unknown as TherapyNote)
          } else {
            processedNotes.push(note as TherapyNote)
          }
        }

        decryptionTime = performance.now() - decryptStart
      } else {
        processedNotes.push(...(data as TherapyNote[]))
      }

      const totalTime = performance.now() - startTime

      // Log audit event for bulk data access
      await auditService.logDataAccess(
        'bulk_read',
        'therapy_note',
        `therapist:${therapistId}${clientId ? ':client:' + clientId : ''}`,
        {
          record_count: processedNotes.length,
          client_id: clientId,
          encrypted: decryptionTime > 0,
          performance_ms: totalTime
        }
      )

      return {
        success: true,
        data: processedNotes,
        encrypted: decryptionTime > 0,
        performance: {
          operationTimeMs: totalTime,
          decryptionTimeMs: decryptionTime
        }
      }

    } catch (error) {
      console.error('Secure bulk retrieve operation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Performance benchmark for secure operations
   */
  async benchmarkSecureOperations(): Promise<{
    encryptionEnabled: boolean
    averageEncryptionMs: number
    averageDecryptionMs: number
    averageOperationMs: number
  }> {
    const sampleNote: Omit<TherapyNote, 'id' | 'created_at' | 'updated_at'> = {
      client_id: 'test-client',
      therapist_id: 'test-therapist',
      session_date: new Date().toISOString(),
      notes: 'Sample therapy note with sensitive information that will be encrypted for security purposes.',
      recommendations: 'Test recommendations for client therapy plan.'
    }

    const iterations = 5
    let totalEncryption = 0
    let totalDecryption = 0
    let totalOperation = 0

    for (let i = 0; i < iterations; i++) {
      // Simulate encryption benchmark
      const result = await encryptionService.benchmarkEncryption(sampleNote.notes)
      totalEncryption += result.encryptionTimeMs
      totalDecryption += result.decryptionTimeMs
      
      // Measure full operation time
      const opStart = performance.now()
      // Simulate processing overhead
      await new Promise(resolve => setTimeout(resolve, 1))
      totalOperation += performance.now() - opStart
    }

    return {
      encryptionEnabled: this.config.enableEncryption,
      averageEncryptionMs: totalEncryption / iterations,
      averageDecryptionMs: totalDecryption / iterations,
      averageOperationMs: totalOperation / iterations
    }
  }

  /**
   * Configure secure data service
   */
  configure(config: Partial<SecureDataConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  getConfig(): SecureDataConfig {
    return { ...this.config }
  }

  /**
   * Check if encryption is available and enabled
   */
  isEncryptionAvailable(): boolean {
    return this.config.enableEncryption && typeof window !== 'undefined' && 'crypto' in window
  }
}

// Export singleton instance
export const secureDataService = new SecureDataService() 