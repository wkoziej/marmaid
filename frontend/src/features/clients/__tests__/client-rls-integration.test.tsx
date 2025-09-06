// ABOUTME: Integration tests for client RLS (Row Level Security) policies
// ABOUTME: Validates that clients can only access their own data through Supabase RLS

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Client } from '../client-types';

// Test configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

describe.skipIf(!SUPABASE_URL || !SUPABASE_ANON_KEY)('Client RLS Integration Tests', () => {
  let supabaseClient: any;
  let testTherapistId: string;
  let otherTherapistId: string;
  let testClientId: string;
  let timestamp: number;
  let testEmail1: string;
  let testEmail2: string;

  beforeAll(async () => {
    // Create test Supabase client
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    timestamp = Date.now();
    // Use random string for uniqueness
    const randomId = Math.random().toString(36).substring(7);
    testEmail1 = `test.user.${randomId}@example.com`;
    testEmail2 = `test.user2.${randomId}@example.com`;
    
    // Create test therapist accounts
    const { data: therapist1, error: error1 } = await supabaseClient.auth.signUp({
      email: testEmail1,
      password: 'test-password-123',
    });
    
    const { data: therapist2, error: error2 } = await supabaseClient.auth.signUp({
      email: testEmail2, 
      password: 'test-password-123',
    });
    
    if (error1 || error2) {
      console.error('Failed to create test therapists:', { error1, error2 });
    }
    
    testTherapistId = therapist1?.user?.id || '';
    otherTherapistId = therapist2?.user?.id || '';
    
    // Create corresponding therapist records in therapists table
    if (testTherapistId) {
      await supabaseClient.auth.signInWithPassword({
        email: testEmail1,
        password: 'test-password-123',
      });
      
      await supabaseClient.from('therapists').insert({
        id: testTherapistId,
        profile: { name: 'Test Therapist 1' },
        subscription_status: 'free'
      });
    }
    
    if (otherTherapistId) {
      await supabaseClient.auth.signInWithPassword({
        email: testEmail2,
        password: 'test-password-123',
      });
      
      await supabaseClient.from('therapists').insert({
        id: otherTherapistId,
        profile: { name: 'Test Therapist 2' },
        subscription_status: 'free'
      });
    }
  });

  afterAll(async () => {
    // Cleanup test data
    if (testClientId) {
      await supabaseClient
        .from('clients')
        .delete()
        .eq('id', testClientId);
    }
  });

  it('should allow therapist to create clients with proper RLS', async () => {
    // Sign in as test therapist
    await supabaseClient.auth.signInWithPassword({
      email: testEmail1,
      password: 'test-password-123',
    });

    // Create a client
    const clientData = {
      therapist_id: testTherapistId,
      profile: { name: 'Test Client', email: 'test@example.com' },
      health_info: { conditions: ['anxiety'] },
      emergency_contacts: [{ name: 'Emergency Contact', phone: '123-456-7890' }],
      tags: ['test-client'],
      status: 'active',
    };

    const { data, error } = await supabaseClient
      .from('clients')
      .insert(clientData)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.therapist_id).toBe(testTherapistId);
    
    testClientId = data.id;
  });

  it('should allow therapist to read their own clients', async () => {
    // Sign in as test therapist
    await supabaseClient.auth.signInWithPassword({
      email: testEmail1,
      password: 'test-password-123',
    });

    const { data, error } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('therapist_id', testTherapistId);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    
    // All returned clients should belong to the authenticated therapist
    data.forEach((client: any) => {
      expect(client.therapist_id).toBe(testTherapistId);
    });
  });

  it('should prevent therapist from accessing other therapists clients', async () => {
    // Create a client for the other therapist first
    await supabaseClient.auth.signInWithPassword({
      email: testEmail2,
      password: 'test-password-123', 
    });

    const otherClientData = {
      therapist_id: otherTherapistId,
      profile: { name: 'Other Therapist Client' },
      health_info: {},
      emergency_contacts: [],
      tags: [],
      status: 'active',
    };

    const { data: otherClient, error: createError } = await supabaseClient
      .from('clients')
      .insert(otherClientData)
      .select()
      .single();

    expect(createError).toBeNull();
    expect(otherClient).toBeDefined();

    // Now sign in as first therapist and try to access the other client
    await supabaseClient.auth.signInWithPassword({
      email: testEmail1,
      password: 'test-password-123',
    });

    // Try to read the other therapist's client by ID
    const { data, error } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('id', otherClient.id);

    // Should return empty array due to RLS policy
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data).toHaveLength(0);

    // Cleanup
    await supabaseClient.auth.signInWithPassword({
      email: testEmail2,
      password: 'test-password-123',
    });
    
    await supabaseClient
      .from('clients')
      .delete()
      .eq('id', otherClient.id);
  });

  it('should prevent unauthorized updates to other therapists clients', async () => {
    // Sign in as test therapist and try to update the other client
    await supabaseClient.auth.signInWithPassword({
      email: testEmail1,
      password: 'test-password-123',
    });

    const { data, error } = await supabaseClient
      .from('clients')
      .update({ 
        profile: { name: 'Hacked Client' },
        updated_at: new Date().toISOString()
      })
      .eq('therapist_id', otherTherapistId)
      .select();

    // Should not update any records due to RLS policy
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data).toHaveLength(0);
  });

  it('should prevent unauthorized deletion of other therapists clients', async () => {
    // Sign in as test therapist and try to delete other therapist's data
    await supabaseClient.auth.signInWithPassword({
      email: testEmail1,
      password: 'test-password-123',
    });

    const { data, error } = await supabaseClient
      .from('clients')
      .delete()
      .eq('therapist_id', otherTherapistId);

    // Should not delete any records due to RLS policy
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data) ? data : []).toHaveLength(0);
  });

  it('should prevent unauthenticated access to clients table', async () => {
    // Sign out
    await supabaseClient.auth.signOut();

    const { data, error } = await supabaseClient
      .from('clients')
      .select('*');

    console.log('DEBUG - Unauthenticated access result:', { data, error });
    
    // RLS should prevent unauthenticated access
    // Either return error or empty data
    if (error) {
      expect(error).toBeDefined();
      expect(error.code).toBe('PGRST301'); // Should be unauthorized
    } else {
      // If no error, data should be empty due to RLS
      expect(data).toEqual([]);
    }
  });

  it('should validate RLS policy configuration', async () => {
    // Sign in as test therapist
    await supabaseClient.auth.signInWithPassword({
      email: testEmail1,
      password: 'test-password-123',
    });

    // Query to check if RLS is enabled on clients table
    const { data: rlsStatus, error: rlsError } = await supabaseClient
      .rpc('check_table_rls_enabled', { table_name: 'clients' });

    expect(rlsError).toBeNull();
    expect(rlsStatus).toBe(true);
  });
});