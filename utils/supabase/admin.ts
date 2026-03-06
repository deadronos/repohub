import type { User } from '@supabase/supabase-js';

export const ADMIN_ACCESS_DENIED_MESSAGE = 'Admin access required';

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? '';
}

export function getAdminEmails(envValue = process.env.ADMIN_EMAILS) {
  return Array.from(
    new Set(
      (envValue ?? '')
        .split(',')
        .map((email) => normalizeEmail(email))
        .filter((email) => email.length > 0),
    ),
  );
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
