import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock react cache since vitest might not be using the React 19 environment correctly
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    cache: vi.fn((fn) => {
      let cached: any;
      return (...args: any[]) => {
        if (!cached) cached = fn(...args);
        return cached;
      };
    }),
  };
});

import { createClient } from '@/utils/supabase/server';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    setAll: vi.fn(),
  }),
}));

describe('supabase client caching', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY', 'dummy-key');
  });

  it('should return the same instance when cached', async () => {
    const client1 = await createClient();
    const client2 = await createClient();

    // They should now be the exact same object
    expect(client1).toBe(client2);
  });
});
