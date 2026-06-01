import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ADMIN_TABLE } from '@/utils/projects/constants';

export const ADMIN_ACCESS_DENIED_MESSAGE = 'Admin access required';

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? '';
}

let cachedEnvValue: string | undefined = undefined;
let cachedEmails: string[] = [];

export function getAdminEmails(envValue = process.env.ADMIN_EMAILS) {
  const effectiveEnvValue = envValue ?? '';

  if (cachedEnvValue === effectiveEnvValue && cachedEmails.length > 0) {
    return cachedEmails;
  }

  const emails = effectiveEnvValue.split(',');
  const uniqueEmails = new Set<string>();

  for (let i = 0; i < emails.length; i++) {
    const normalized = normalizeEmail(emails[i]);
    if (normalized.length > 0) {
      uniqueEmails.add(normalized);
    }
  }

  cachedEnvValue = effectiveEnvValue;
  cachedEmails = Array.from(uniqueEmails);

  return cachedEmails;
}

export function isAdminUser(
  user: Pick<User, 'email'> | null | undefined,
  envValue = process.env.ADMIN_EMAILS,
) {
  const email = normalizeEmail(user?.email);
  if (!email) {
    return false;
  }

  return getAdminEmails(envValue).includes(email);
}

/**
 * Validates that an admin email exists in the DB admin table.
 * Used as a secondary check when ADMIN_EMAILS env var check passes.
 */
export async function isAdminEmailInDb(supabase: SupabaseClient): Promise<boolean> {
  const result = (await supabase.rpc('is_admin_email')) as {
    data: boolean | null;
    error: Error | null;
  };

  if (result.error) {
    console.error('Failed to validate admin email against DB:', result.error);
    return false;
  }

  return result.data === true;
}

/**
 * Validates that the ADMIN_EMAILS env var matches the admin table in DB.
 * Call this at application startup to ensure configuration alignment.
 */
export async function validateAdminEmailsMatch(
  supabase: SupabaseClient,
  envValue = process.env.ADMIN_EMAILS,
): Promise<{ valid: boolean; discrepancies: string[] }> {
  const envEmails = getAdminEmails(envValue);
  const { data, error } = await supabase.from(ADMIN_TABLE).select('email');

  if (error) {
    console.error('Failed to validate admin emails against DB:', error);
    return { valid: false, discrepancies: [] };
  }

  const dbEmails = new Set((data ?? []).map((row: { email: string }) => normalizeEmail(row.email)));
  const discrepancies: string[] = [];

  for (const email of envEmails) {
    if (!dbEmails.has(email)) {
      discrepancies.push(`ENV: ${email} not in DB`);
    }
  }

  for (const email of dbEmails) {
    if (!envEmails.includes(email)) {
      discrepancies.push(`DB: ${email} not in ENV`);
    }
  }

  return { valid: discrepancies.length === 0, discrepancies };
}

/**
 * Logs a console warning when the ADMIN_EMAILS env var and the
 * `public.admin_emails` DB table are out of sync. Intended to be
 * called from the admin dashboard server component so drift surfaces
 * loudly in server logs without blocking the request.
 */
export async function warnIfAdminAllowlistsDiverge(supabase: SupabaseClient): Promise<void> {
  const { valid, discrepancies } = await validateAdminEmailsMatch(supabase);

  if (valid) {
    return;
  }

  console.warn(
    `[RepoHub] Admin allowlist drift detected between ADMIN_EMAILS env and ${ADMIN_TABLE} table.\n` +
      `  This can cause admins to be redirected back to /login unexpectedly.\n` +
      `  Discrepancies:\n` +
      discrepancies.map((d) => `    - ${d}`).join('\n'),
  );
}

export function buildLoginRedirectPath(message = ADMIN_ACCESS_DENIED_MESSAGE) {
  const searchParams = new URLSearchParams({ message });
  return `/login?${searchParams.toString()}`;
}
