import type { SupabaseClient } from '@supabase/supabase-js';
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
