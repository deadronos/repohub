import type { SupabaseClient, User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export async function ensureUser(supabase: SupabaseClient, shouldRedirect = false) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && shouldRedirect) {
    redirect('/login');
  }

  return user;
}

export async function requireUserOrUnauthorized(
  supabase: SupabaseClient,
): Promise<{ data: User } | { error: 'Unauthorized' }> {
  const user = await ensureUser(supabase);
  if (!user) {
    return { error: 'Unauthorized' };
  }

  return { data: user };
}
