// ABOUTME: Integration tests for client CRUD operations
// ABOUTME: Tests full client workflow with mocked Supabase client

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { clientService } from '../client-service';
import type { Client, CreateClientData, UpdateClientData } from '../client-types';

// Mock Supabase with proper chainable interface
vi.mock('../../../lib/supabase', () => {
  const mockQueryBuilder = {
    select: vi.fn(),
    insert: vi.fn(), 
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
    or: vi.fn(),
    overlaps: vi.fn(),
    then: vi.fn(), // For making the builder awaitable
  };

  // Make all methods chainable except single and then
  Object.keys(mockQueryBuilder).forEach(key => {
    if (key !== 'single' && key !== 'then') {
      (mockQueryBuilder as any)[key].mockReturnValue(mockQueryBuilder);
    }
  });

  // Make the builder awaitable by implementing then
  mockQueryBuilder.then.mockImplementation((resolve, reject) => {
    // Default resolved value
    return Promise.resolve({ data: [], error: null }).then(resolve, reject);
  });

  return {
    supabase: {
      from: vi.fn().mockReturnValue(mockQueryBuilder),
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: 'test-user-id' },
              access_token: 'test-access-token'
            }
          }
        })
      },
      _mockQueryBuilder: mockQueryBuilder // Expose for testing
    }
  };
});

vi.mock('../../../lib/audit', () => ({
  auditService: {
    logDataAccess: vi.fn().mockResolvedValue(true),
    logDataModify: vi.fn().mockResolvedValue(true),
  }
}));

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

// Import the mocked modules
import { supabase } from '../../../lib/supabase';
import { auditService } from '../../../lib/audit';
import { encryptionService } from '../../../lib/encryption';

// Get typed access to mocked functions
const mockSupabase = supabase as any;
const mockQueryBuilder = mockSupabase._mockQueryBuilder;

describe('Client Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    // Reset all mock return values to maintain chainability
    if (mockQueryBuilder) {
      Object.keys(mockQueryBuilder).forEach(key => {
        if (key !== 'single' && key !== 'then') {
          (mockQueryBuilder as any)[key].mockReturnValue(mockQueryBuilder);
        }
      });
      // Reset the then mock to default behavior
      mockQueryBuilder.then.mockImplementation((resolve, reject) => {
        return Promise.resolve({ data: [], error: null }).then(resolve, reject);
      });
    }
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Client CRUD Operations', () => {
    const mockTherapistId = 'therapist-1';
    const mockClient: Client = {
      id: 'client-1',
      therapist_id: mockTherapistId,
      profile: {
        name: 'Jan Kowalski',
        email: 'jan@example.com',
        phone: '+48 123 456 789',
        date_of_birth: '1990-01-01',
        address: {
          street: 'ul. Przykładowa 123',
          city: 'Warszawa',
          postal_code: '00-000',
          country: 'Polska',
        },
        demographics: {
          gender: 'Mężczyzna',
          preferred_language: 'Polski',
          occupation: 'Programista',
          marital_status: 'Żonaty',
        },
        notes: 'Test client notes',
      },
      health_info: {
        conditions: ['anxiety'],
        medications: ['medication1'],
        allergies: ['pollen'],
        medical_history: 'No significant medical history',
        therapy_goals: ['stress management'],
        previous_therapy: 'None',
        risk_factors: [],
        assessment_notes: 'Initial assessment complete',
      },
      emergency_contacts: [
        {
          id: 'contact-1',
          name: 'Anna Kowalska',
          relationship: 'Żona',
          phone: '+48 987 654 321',
          email: 'anna@example.com',
          address: 'ul. Przykładowa 123, Warszawa',
          is_primary: true,
        },
      ],
      tags: ['vip', 'priority'],
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should complete full client lifecycle', async () => {
      // Test 1: Create client
      const createData: CreateClientData = {
        profile: {
          name: 'Jan Kowalski',
          email: 'jan@example.com',
          phone: '+48 123 456 789',
        },
        tags: ['new-client'],
        status: 'active',
      };

      // Configure the mock for create operation
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: {
          ...mockClient,
          profile: createData.profile,
          tags: createData.tags,
        },
        error: null,
      });

      const createResult = await clientService.createClient(mockTherapistId, createData);
      expect(createResult.error).toBeNull();
      expect(createResult.data?.profile.name).toBe('Jan Kowalski');
      expect(createResult.data?.tags).toContain('new-client');

      // Test 2: Get client by ID
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: mockClient,
        error: null,
      });

      const getResult = await clientService.getClientById('client-1');
      expect(getResult.error).toBeNull();
      expect(getResult.data?.id).toBe('client-1');
      expect(getResult.data?.profile.name).toBe('Jan Kowalski');

      // Test 3: Update client
      const updateData: UpdateClientData = {
        id: 'client-1',
        profile: {
          name: 'Jan Kowalski Updated',
          email: 'jan.updated@example.com',
        },
        status: 'inactive',
      };

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: {
          ...mockClient,
          profile: {
            ...mockClient.profile,
            ...updateData.profile,
          },
          status: 'inactive',
        },
        error: null,
      });

      const updateResult = await clientService.updateClient(updateData);
      expect(updateResult.error).toBeNull();
      expect(updateResult.data?.profile.name).toBe('Jan Kowalski Updated');
      expect(updateResult.data?.status).toBe('inactive');

      // Test 4: Get clients list (awaits query directly)
      mockQueryBuilder.then.mockImplementationOnce((resolve) => {
        return Promise.resolve({ data: [updateResult.data], error: null }).then(resolve);
      });

      const listResult = await clientService.getClientsByTherapistId(mockTherapistId);
      expect(listResult.error).toBeNull();
      expect(listResult.data).toHaveLength(1);
      expect(listResult.data?.[0].profile.name).toBe('Jan Kowalski Updated');

      // Test 5: Delete client (awaits query directly)
      mockQueryBuilder.then.mockImplementationOnce((resolve) => {
        return Promise.resolve({ data: null, error: null }).then(resolve);
      });

      const deleteResult = await clientService.deleteClient('client-1');
      expect(deleteResult.error).toBeNull();
    });

    it('should handle complex client data correctly', async () => {
      // Create client with full profile data
      const complexCreateData: CreateClientData = {
        profile: {
          name: 'Maria Nowak',
          email: 'maria@example.com',
          phone: '+48 555 666 777',
          date_of_birth: '1985-05-15',
          address: {
            street: 'ul. Długa 456',
            city: 'Kraków',
            postal_code: '30-001',
            country: 'Polska',
          },
          demographics: {
            gender: 'Kobieta',
            preferred_language: 'Polski',
            occupation: 'Nauczycielka',
            marital_status: 'Panna',
          },
          notes: 'Klient z doświadczeniem w terapii grupowej',
        },
        health_info: {
          conditions: ['depression', 'anxiety'],
          medications: ['sertraline', 'alprazolam'],
          allergies: ['penicillin', 'shellfish'],
          medical_history: 'Treated for depression since 2020',
          therapy_goals: ['mood stabilization', 'anxiety management'],
          previous_therapy: 'CBT therapy for 6 months',
          risk_factors: ['family history of mental illness'],
          assessment_notes: 'Cooperative patient, good insight',
        },
        emergency_contacts: [
          {
            name: 'Piotr Nowak',
            relationship: 'Brat',
            phone: '+48 444 555 666',
            email: 'piotr@example.com',
            address: 'ul. Krótka 789, Kraków',
            is_primary: true,
          },
          {
            name: 'Jan Nowak',
            relationship: 'Ojciec',
            phone: '+48 333 444 555',
            is_primary: false,
          },
        ],
        tags: ['priority', 'depression-treatment', 'weekly-sessions'],
        status: 'active',
      };

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: {
          id: 'complex-client-1',
          therapist_id: mockTherapistId,
          profile: complexCreateData.profile,
          health_info: complexCreateData.health_info,
          emergency_contacts: complexCreateData.emergency_contacts,
          tags: complexCreateData.tags,
          status: complexCreateData.status,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

      const result = await clientService.createClient(mockTherapistId, complexCreateData);
      
      expect(result.error).toBeNull();
      expect(result.data?.profile.demographics?.occupation).toBe('Nauczycielka');
      expect(result.data?.health_info.conditions).toContain('depression');
      expect(result.data?.health_info.conditions).toContain('anxiety');
      expect(result.data?.emergency_contacts).toHaveLength(2);
      expect(result.data?.emergency_contacts?.[0].is_primary).toBe(true);
      expect(result.data?.tags).toContain('priority');
      expect(result.data?.tags).toContain('depression-treatment');
    });
  });

  describe('Search and Filter Operations', () => {
    const mockClients: Client[] = [
      {
        id: 'client-1',
        therapist_id: 'therapist-1',
        profile: { name: 'Jan Kowalski', email: 'jan@example.com' },
        health_info: {},
        emergency_contacts: [],
        tags: ['vip', 'weekly'],
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'client-2',
        therapist_id: 'therapist-1',
        profile: { name: 'Anna Nowak', email: 'anna@example.com' },
        health_info: {},
        emergency_contacts: [],
        tags: ['priority'],
        status: 'inactive',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'client-3',
        therapist_id: 'therapist-1',
        profile: { name: 'Piotr Wiśniewski', email: 'piotr@example.com' },
        health_info: {},
        emergency_contacts: [],
        tags: ['archived-case'],
        status: 'archived',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    it('should search clients by name', async () => {
      // Mock search for 'Jan' (awaits query directly)
      mockQueryBuilder.then.mockImplementationOnce((resolve) => {
        return Promise.resolve({ data: [mockClients[0]], error: null }).then(resolve);
      });

      const result = await clientService.searchClients('therapist-1', 'Jan');
      
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].profile.name).toBe('Jan Kowalski');
      expect(mockQueryBuilder.or).toHaveBeenCalledWith('profile->name.ilike.%Jan%');
    });

    it('should filter clients by status', async () => {
      // Mock filter for active clients (awaits query directly)
      mockQueryBuilder.then.mockImplementationOnce((resolve) => {
        return Promise.resolve({ data: [mockClients[0]], error: null }).then(resolve);
      });

      const result = await clientService.getClientsByStatus('therapist-1', 'active');
      
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].status).toBe('active');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('status', 'active');
    });

    it('should filter clients by tags', async () => {
      // Mock filter for clients with 'vip' tag (awaits query directly)
      mockQueryBuilder.then.mockImplementationOnce((resolve) => {
        return Promise.resolve({ data: [mockClients[0]], error: null }).then(resolve);
      });

      const result = await clientService.searchClients('therapist-1', '', ['vip']);
      
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].tags).toContain('vip');
      expect(mockQueryBuilder.overlaps).toHaveBeenCalledWith('tags', ['vip']);
    });

    it('should combine search and tag filters', async () => {
      // Mock search for 'Jan' with 'vip' tag (awaits query directly)
      mockQueryBuilder.then.mockImplementationOnce((resolve) => {
        return Promise.resolve({ data: [mockClients[0]], error: null }).then(resolve);
      });

      const result = await clientService.searchClients('therapist-1', 'Jan', ['vip']);
      
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].profile.name).toBe('Jan Kowalski');
      expect(result.data?.[0].tags).toContain('vip');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle RLS policy violations', async () => {
      // Mock RLS violation (unauthorized access)
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Insufficient privileges', code: 'PGRST301', details: null, hint: null },
      });

      const result = await clientService.getClientById('unauthorized-client');
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(403);
      expect(result.error?.message).toBe('Insufficient privileges');
    });

    it('should handle network failures gracefully', async () => {
      // Mock network error by making then reject
      mockQueryBuilder.then.mockImplementationOnce((resolve, reject) => {
        return Promise.reject(new Error('Network error')).then(resolve, reject);
      });

      const result = await clientService.getClientsByTherapistId('therapist-1');
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Network error occurred');
      expect(result.error?.status).toBe(0);
    });

    it('should handle empty results correctly', async () => {
      // Mock empty result set (awaits query directly)
      mockQueryBuilder.then.mockImplementationOnce((resolve) => {
        return Promise.resolve({ data: [], error: null }).then(resolve);
      });

      const result = await clientService.getClientsByTherapistId('therapist-with-no-clients');
      
      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });

    it('should handle malformed data gracefully', async () => {
      // Mock malformed client data
      const malformedClient = {
        id: 'malformed-client',
        therapist_id: 'therapist-1',
        profile: null, // Invalid profile data
        health_info: undefined,
        emergency_contacts: null,
        tags: null,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: malformedClient,
        error: null,
      });

      const result = await clientService.getClientById('malformed-client');
      
      expect(result.error).toBeNull();
      expect(result.data?.profile).toEqual({});
      expect(result.data?.health_info).toEqual({});
      expect(result.data?.emergency_contacts).toEqual([]);
      expect(result.data?.tags).toEqual([]);
    });
  });

  describe('Data Validation and Sanitization', () => {
    it('should handle optional fields correctly', async () => {
      const minimalCreateData: CreateClientData = {
        profile: {
          name: 'Minimal Client',
        },
      };

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: {
          id: 'minimal-client',
          therapist_id: 'therapist-1',
          profile: minimalCreateData.profile,
          health_info: {},
          emergency_contacts: [],
          tags: [],
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

      const result = await clientService.createClient('therapist-1', minimalCreateData);
      
      expect(result.error).toBeNull();
      expect(result.data?.profile.name).toBe('Minimal Client');
      expect(result.data?.health_info).toEqual({});
      expect(result.data?.emergency_contacts).toEqual([]);
      expect(result.data?.tags).toEqual([]);
    });

    it('should preserve data types correctly', async () => {
      const createData: CreateClientData = {
        profile: {
          name: 'Type Test Client',
          date_of_birth: '1990-01-01',
        },
        tags: ['tag1', 'tag2'],
        status: 'active',
      };

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: {
          id: 'type-test-client',
          therapist_id: 'therapist-1',
          profile: createData.profile,
          health_info: {},
          emergency_contacts: [],
          tags: createData.tags,
          status: createData.status,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

      const result = await clientService.createClient('therapist-1', createData);
      
      expect(result.error).toBeNull();
      expect(result.data?.tags).toEqual(['tag1', 'tag2']);
      expect(Array.isArray(result.data?.tags)).toBe(true);
      expect(typeof result.data?.profile.name).toBe('string');
      expect(result.data?.status).toBe('active');
    });
  });
});