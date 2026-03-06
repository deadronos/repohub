import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createServerClientMock, getUserMock } = vi.hoisted(() => ({
  createServerClientMock: vi.fn(),
  getUserMock: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: createServerClientMock,
}));

import { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

describe('supabase middleware admin authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: getUserMock,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('redirects authenticated non-admin users away from /admin', async () => {
    vi.stubEnv('ADMIN_EMAILS', 'admin@example.com');
    getUserMock.mockResolvedValue({
      data: {
        user: {
          email: 'viewer@example.com',
        },
      },
    });

    const response = await updateSession(new NextRequest('http://localhost/admin'));
    const location = response.headers.get('location');
    const redirectUrl = new URL(location ?? 'http://localhost');

    expect(response.status).toBe(307);
    expect(location).toBeTruthy();
    expect(redirectUrl.pathname).toBe('/login');
    expect(redirectUrl.searchParams.get('message')).toBe('Admin access required');
  });

  it('allows allowlisted admin users through /admin', async () => {
    vi.stubEnv('ADMIN_EMAILS', 'admin@example.com');
    getUserMock.mockResolvedValue({
      data: {
        user: {
          email: 'admin@example.com',
        },
      },
    });

    const response = await updateSession(new NextRequest('http://localhost/admin'));

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });
});
