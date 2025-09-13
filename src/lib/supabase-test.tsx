// ABOUTME: Temporary test component to verify Supabase connection and basic functionality
// ABOUTME: This file can be removed after integration testing is complete

import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<
    'testing' | 'connected' | 'error'
  >('testing');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic Supabase connection by getting current session
        const { error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        // Also test database connection with user_profiles table
        const { error: dbError } = await supabase
          .from('user_profiles')
          .select('count')
          .limit(0);

        if (dbError && dbError.code !== 'PGRST116') {
          // PGRST116 is "no rows found" which is OK - means table exists
          throw dbError;
        }

        setConnectionStatus('connected');
      } catch (err) {
        console.error('Supabase connection error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setConnectionStatus('error');
      }
    };

    testConnection();
  }, []);

  return (
    <div
      className='p-4 border rounded-md'
      data-testid='supabase-connection-test'
    >
      <h3 className='text-lg font-medium mb-2'>Supabase Connection Test</h3>

      {connectionStatus === 'testing' && (
        <p className='text-blue-600'>Testing connection...</p>
      )}

      {connectionStatus === 'connected' && (
        <p className='text-green-600' data-testid='supabase-success'>
          ✓ Successfully connected to Supabase
        </p>
      )}

      {connectionStatus === 'error' && (
        <div>
          <p className='text-red-600' data-testid='supabase-error'>
            ✗ Failed to connect to Supabase
          </p>
          {error && <p className='text-sm text-red-500 mt-1'>Error: {error}</p>}
        </div>
      )}
    </div>
  );
};
