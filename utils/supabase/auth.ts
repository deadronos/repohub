import type { SupabaseClient, User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { buildLoginRedirectPath, isAdminUser } from '@/utils/supabase/admin';

export async function ensureUser(supabase: SupabaseClient, shouldRedirect = false) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && shouldRedirect) {
    redirect('/login');
  }

  return user;
}

export async function ensureAdmin(supabase: SupabaseClient, shouldRedirect = false) {
  const user = await ensureUser(supabase);

  if (user && isAdminUser(user)) {
    return user;
  }

  if (shouldRedirect) {
    redirect(buildLoginRedirectPath());
  }

  return null;
}

export async function requireAdminOrUnauthorized(
  supabase: SupabaseClient,
): Promise<{ data: User } | { error: 'Unauthorized' }> {
  const user = await ensureAdmin(supabase);
  if (!user) {
    return { error: 'Unauthorized' };
  }

  return { data: user };
}
