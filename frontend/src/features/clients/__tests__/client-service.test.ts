// ABOUTME: Unit tests for ClientService class
// ABOUTME: Tests CRUD operations, error handling, and audit logging integration

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock supabase with auth - must be hoisted to top
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
    or: vi.fn().mockReturnThis(),
    overlaps: vi.fn().mockReturnThis(),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: 'test-user-id' },
            access_token: 'test-access-token'
          }
        }
      })
    }
  }
}));

// Mock audit service
vi.mock('../../../lib/audit', () => ({
  auditService: {
    logDataAccess: vi.fn().mockResolvedValue(true),
    logDataModify: vi.fn().mockResolvedValue(true),
  }
}));

// Mock encryption service
vi.mock('../../../lib/encryption', () => ({
  encryptionService: {
    encryptData: vi.fn().mockResolvedValue({
      data: 'encrypted-data',
      iv: 'test-iv',
      salt: 'test-salt',
      timestamp: '2024-01-01T00:00:00Z',
      version: '1.0'
    }),
    decryptData: vi.fn().mockResolvedValue('decrypted-data'),
    generateUserKey: vi.fn().mockReturnValue('test-user-key'),
    validateEncryptedData: vi.fn().mockReturnValue(false),
  }
}));

import { clientService } from '../client-service';
import type { CreateClientData, UpdateClientData } from '../client-types';

// Import mocked modules directly
import { supabase } from '../../../lib/supabase';
import { auditService } from '../../../lib/audit';
import { encryptionService } from '../../../lib/encryption';

// Cast to get mocked functions
const mockSupabase = supabase as any;
const mockAuditService = auditService as any;
const mockEncryptionService = encryptionService as any;

describe('ClientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getClientsByTherapistId', () => {
    it('should fetch clients successfully', async () => {
      const mockClients = [
        {
          id: 'client-1',
          therapist_id: 'therapist-1',
          profile: { name: 'Jan Kowalski' },
          health_info: {},
          emergency_contacts: [],
          tags: ['tag1'],
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      // Mock the entire Supabase query chain
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockClients,
              error: null,
            }),
          }),
        }),
      });

      const result = await clientService.getClientsByTherapistId('therapist-1');

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].profile.name).toBe('Jan Kowalski');
      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      expect(mockAuditService.logDataAccess).toHaveBeenCalledWith(
        'list_clients',
        'clients',
        'therapist-1',
        { client_count: 1 }
      );
    });

    it('should handle errors when fetching clients', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error', code: 'PGRST500' },
            }),
          }),
        }),
      });

      const result = await clientService.getClientsByTherapistId('therapist-1');

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Database error');
      expect(result.error?.status).toBe(500);
    });

    it('should handle network errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockRejectedValue(new Error('Network error')),
          }),
        }),
      });

      const result = await clientService.getClientsByTherapistId('therapist-1');

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Network error occurred');
      expect(result.error?.status).toBe(0);
    });
  });

  describe('getClientById', () => {
    it('should fetch a single client successfully', async () => {
      const mockClient = {
        id: 'client-1',
        therapist_id: 'therapist-1',
        profile: { name: 'Jan Kowalski', email: 'jan@example.com' },
        health_info: { conditions: ['anxiety'] },
        emergency_contacts: [],
        tags: ['vip'],
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockClient,
              error: null,
            }),
          }),
        }),
      });

      const result = await clientService.getClientById('client-1');

      expect(result.error).toBeNull();
      expect(result.data?.id).toBe('client-1');
      expect(result.data?.profile.name).toBe('Jan Kowalski');
      expect(mockAuditService.logDataAccess).toHaveBeenCalledWith(
        'get_client',
        'client',
        'client-1',
        { client_name: 'Jan Kowalski' }
      );
    });

    it('should return null for non-existent client', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found', code: 'PGRST116' },
            }),
          }),
        }),
      });

      const result = await clientService.getClientById('nonexistent');

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe('createClient', () => {
    it('should create a new client successfully', async () => {
      const createData: CreateClientData = {
        profile: {
          name: 'Anna Nowak',
          email: 'anna@example.com',
        },
        tags: ['new-client'],
        status: 'active',
      };

      const mockCreatedClient = {
        id: 'new-client-id',
        therapist_id: 'therapist-1',
        profile: createData.profile,
        health_info: {},
        emergency_contacts: [],
        tags: createData.tags,
        status: createData.status,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCreatedClient,
              error: null,
            }),
          }),
        }),
      });

      const result = await clientService.createClient('therapist-1', createData);

      expect(result.error).toBeNull();
      expect(result.data?.profile.name).toBe('Anna Nowak');
    });

    it('should handle validation errors', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Validation failed', code: 'PGRST400' },
            }),
          }),
        }),
      });

      const createData: CreateClientData = {
        profile: { name: '' }, // Invalid empty name
      };

      const result = await clientService.createClient('therapist-1', createData);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Validation failed');
    });
  });

  describe('updateClient', () => {
    it('should update client successfully', async () => {
      const updateData: UpdateClientData = {
        id: 'client-1',
        profile: {
          name: 'Jan Kowalski Updated',
          email: 'jan.updated@example.com',
        },
        status: 'inactive',
      };

      const mockUpdatedClient = {
        id: 'client-1',
        therapist_id: 'therapist-1',
        profile: updateData.profile,
        health_info: {},
        emergency_contacts: [],
        tags: [],
        status: 'inactive',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUpdatedClient,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await clientService.updateClient(updateData);

      expect(result.error).toBeNull();
      expect(result.data?.profile.name).toBe('Jan Kowalski Updated');
      expect(result.data?.status).toBe('inactive');
    });

    it('should handle unauthorized access', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Unauthorized', code: 'PGRST301' },
              }),
            }),
          }),
        }),
      });

      const updateData: UpdateClientData = {
        id: 'client-1',
        profile: { name: 'Updated Name' },
      };

      const result = await clientService.updateClient(updateData);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(403);
    });
  });

  describe('deleteClient', () => {
    it('should delete client successfully', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      const result = await clientService.deleteClient('client-1');

      expect(result.error).toBeNull();
    });

    it('should handle deletion errors', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Cannot delete', code: 'PGRST500' },
          }),
        }),
      });

      const result = await clientService.deleteClient('client-1');

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Cannot delete');
    });
  });

  describe('searchClients', () => {
    it('should search clients by name', async () => {
      const mockClients = [
        {
          id: 'client-1',
          therapist_id: 'therapist-1',
          profile: { name: 'Jan Kowalski' },
          health_info: {},
          emergency_contacts: [],
          tags: [],
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockClients,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await clientService.searchClients('therapist-1', 'Jan');

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
    });

    it('should search clients by tags', async () => {
      const mockClients = [
        {
          id: 'client-1',
          therapist_id: 'therapist-1',
          profile: { name: 'Jan Kowalski' },
          health_info: {},
          emergency_contacts: [],
          tags: ['vip', 'priority'],
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            overlaps: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockClients,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await clientService.searchClients('therapist-1', '', ['vip']);

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getClientsByStatus', () => {
    it('should filter clients by status', async () => {
      const mockActiveClients = [
        {
          id: 'client-1',
          therapist_id: 'therapist-1',
          profile: { name: 'Active Client' },
          health_info: {},
          emergency_contacts: [],
          tags: [],
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockActiveClients,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await clientService.getClientsByStatus('therapist-1', 'active');

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
    });
  });
});