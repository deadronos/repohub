import type { User } from '@supabase/supabase-js';

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

export function buildLoginRedirectPath(message = ADMIN_ACCESS_DENIED_MESSAGE) {
  const searchParams = new URLSearchParams({ message });
  return `/login?${searchParams.toString()}`;
}
