import type { User } from '@supabase/supabase-js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAdminEmails, isAdminUser } from '@/utils/supabase/admin';

describe('supabase admin allowlist', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('normalizes and deduplicates ADMIN_EMAILS', () => {
    vi.stubEnv(
      'ADMIN_EMAILS',
      ' Admin@example.com,viewer@example.com,admin@example.com, ,owner@example.com ',
    );

    expect(getAdminEmails()).toEqual([
      'admin@example.com',
      'viewer@example.com',
      'owner@example.com',
    ]);
  });

  it('allows only users whose email appears in ADMIN_EMAILS', () => {
    vi.stubEnv('ADMIN_EMAILS', 'admin@example.com');
    const adminUser = { email: 'ADMIN@example.com' } as Pick<User, 'email'>;
    const viewerUser = { email: 'viewer@example.com' } as Pick<User, 'email'>;

    expect(isAdminUser(adminUser)).toBe(true);
    expect(isAdminUser(viewerUser)).toBe(false);
    expect(isAdminUser(null)).toBe(false);
  });
});
