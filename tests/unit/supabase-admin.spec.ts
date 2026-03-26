import type { User } from '@supabase/supabase-js';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('supabase admin allowlist', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function importAdmin() {
    const mod = await import('@/utils/supabase/admin');
    return mod;
  }

  it('normalizes and deduplicates ADMIN_EMAILS', async () => {
    vi.stubEnv(
      'ADMIN_EMAILS',
      ' Admin@example.com,viewer@example.com,admin@example.com, ,owner@example.com ',
    );

    const { getAdminEmails } = await importAdmin();

    expect(getAdminEmails()).toEqual([
      'admin@example.com',
      'viewer@example.com',
      'owner@example.com',
    ]);
  });

  it('allows only users whose email appears in ADMIN_EMAILS', async () => {
    vi.stubEnv('ADMIN_EMAILS', 'admin@example.com');
    const { isAdminUser } = await importAdmin();
    const adminUser = { email: 'ADMIN@example.com' } as Pick<User, 'email'>;
    const viewerUser = { email: 'viewer@example.com' } as Pick<User, 'email'>;

    expect(isAdminUser(adminUser)).toBe(true);
    expect(isAdminUser(viewerUser)).toBe(false);
    expect(isAdminUser(null)).toBe(false);
  });

  describe('caching', () => {
    it('caches results across multiple calls', async () => {
      vi.stubEnv('ADMIN_EMAILS', 'admin@example.com');
      const { getAdminEmails } = await importAdmin();

      const first = getAdminEmails();
      const second = getAdminEmails();

      expect(first).toBe(second);
      expect(first).toEqual(['admin@example.com']);
    });

    it('invalidates cache when env value changes', async () => {
      vi.stubEnv('ADMIN_EMAILS', 'admin@example.com');
      const { getAdminEmails } = await importAdmin();

      const first = getAdminEmails();

      vi.unstubAllEnvs();
      vi.stubEnv('ADMIN_EMAILS', 'newadmin@example.com');

      const second = getAdminEmails();

      expect(first).not.toBe(second);
      expect(second).toEqual(['newadmin@example.com']);
    });

    it('does not cache empty env value', async () => {
      vi.stubEnv('ADMIN_EMAILS', '');
      const { getAdminEmails } = await importAdmin();

      const first = getAdminEmails();
      const second = getAdminEmails();

      expect(first).toEqual([]);
      expect(second).toEqual([]);
      expect(first).not.toBe(second);
    });
  });
});
