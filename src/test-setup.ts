import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Mock Supabase for unit tests to avoid requiring environment variables
vi.mock('./lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnValue({ data: null, error: null }),
      update: vi.fn().mockReturnValue({ data: null, error: null }),
      delete: vi.fn().mockReturnValue({ data: null, error: null }),
      limit: vi.fn().mockReturnValue({ data: [], error: null }),
    }),
    auth: {
      signIn: vi.fn().mockReturnValue({ data: null, error: null }),
      signOut: vi.fn().mockReturnValue({ error: null }),
      getUser: vi.fn().mockReturnValue({ data: { user: null }, error: null }),
      getSession: vi
        .fn()
        .mockReturnValue({ data: { session: null }, error: null }),
    },
  },
}));

afterEach(() => {
  cleanup();
});
