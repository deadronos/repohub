import { beforeEach, describe, expect, it, vi } from 'vitest';

const { isAdminUserMock, isAdminEmailInDbMock } = vi.hoisted(() => ({
  isAdminUserMock: vi.fn(),
  isAdminEmailInDbMock: vi.fn(),
}));

vi.mock('@/utils/supabase/admin', () => ({
  buildLoginRedirectPath: vi.fn(() => '/login?message=Admin+access+required'),
  isAdminUser: isAdminUserMock,
  isAdminEmailInDb: isAdminEmailInDbMock,
}));

import { ensureAdmin } from '@/utils/supabase/auth';

function createSupabaseWithUser(user: { email: string } | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
  };
}

describe('ensureAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires both ADMIN_EMAILS and the database admin allowlist', async () => {
    const user = { email: 'admin@example.com' };
    const supabase = createSupabaseWithUser(user);
    isAdminUserMock.mockReturnValue(true);
    isAdminEmailInDbMock.mockResolvedValue(false);

    await expect(ensureAdmin(supabase as never)).resolves.toBeNull();
    expect(isAdminEmailInDbMock).toHaveBeenCalledWith(supabase);
  });

  it('returns the user when both admin allowlists pass', async () => {
    const user = { email: 'admin@example.com' };
    const supabase = createSupabaseWithUser(user);
    isAdminUserMock.mockReturnValue(true);
    isAdminEmailInDbMock.mockResolvedValue(true);

    await expect(ensureAdmin(supabase as never)).resolves.toBe(user);
  });
});
