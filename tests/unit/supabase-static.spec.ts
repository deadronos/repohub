import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock,
}));

import { createStaticClient } from '@/utils/supabase/static';

describe('createStaticClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns null if environment variables are missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY', '');

    expect(createStaticClient()).toBeNull();
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('returns null if environment variables are placeholders', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://your-project.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY', 'your-publishable-key');

    expect(createStaticClient()).toBeNull();
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('returns null if Supabase URL is invalid', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'not-a-url');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY', 'valid-key');

    expect(createStaticClient()).toBeNull();
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('returns a Supabase client if environment variables are valid', () => {
    const mockClient = { supabase: 'client' };
    createClientMock.mockReturnValue(mockClient);

    const validUrl = 'https://valid-project.supabase.co';
    const validKey = 'valid-publishable-key';

    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', validUrl);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY', validKey);

    const client = createStaticClient();

    expect(client).toBe(mockClient);
    expect(createClientMock).toHaveBeenCalledWith(validUrl, validKey);
  });
});
