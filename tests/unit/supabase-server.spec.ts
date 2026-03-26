import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@/utils/supabase/server';
import * as ssr from '@supabase/ssr';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([{ name: 'test', value: '123' }]),
    set: vi.fn(),
  }),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((url, key, options) => ({
    url,
    key,
    options,
  })),
}));

describe('supabase server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates client with cookies', async () => {
    const client = await createClient() as any;

    expect(ssr.createServerClient).toHaveBeenCalled();
    expect(client.options.cookies.getAll()).toEqual([{ name: 'test', value: '123' }]);
  });

  it('sets cookies properly', async () => {
    const mockCookieStore = {
      getAll: vi.fn(),
      set: vi.fn(),
    };

    vi.mocked(await import('next/headers')).cookies.mockResolvedValue(mockCookieStore as any);

    const client = await createClient() as any;
    client.options.cookies.setAll([{ name: 'new', value: 'value', options: {} }]);

    expect(mockCookieStore.set).toHaveBeenCalledWith('new', 'value', {});
  });

  it('handles cookie set error in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const mockCookieStore = {
      getAll: vi.fn(),
      set: vi.fn().mockImplementation(() => { throw new Error('Cannot set cookie'); }),
    };

    vi.mocked(await import('next/headers')).cookies.mockResolvedValue(mockCookieStore as any);

    const client = await createClient() as any;
    client.options.cookies.setAll([{ name: 'new', value: 'value', options: {} }]);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Ignored Supabase cookie set attempt from Server Component (this is expected behavior in Server Components):',
      expect.any(Error)
    );

    consoleWarnSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it('handles cookie set error without logging in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const mockCookieStore = {
      getAll: vi.fn(),
      set: vi.fn().mockImplementation(() => { throw new Error('Cannot set cookie'); }),
    };

    vi.mocked(await import('next/headers')).cookies.mockResolvedValue(mockCookieStore as any);

    const client = await createClient() as any;
    client.options.cookies.setAll([{ name: 'new', value: 'value', options: {} }]);

    expect(consoleWarnSpy).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
    vi.unstubAllEnvs();
  });
});
