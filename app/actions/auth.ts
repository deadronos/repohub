'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { LOGIN_FEEDBACK_MESSAGE } from '@/utils/auth-feedback';
import { buildLoginRedirectPath, isAdminUser } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { getFormString } from '@/utils/form';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = getFormString(formData, 'email');
  const password = getFormString(formData, 'password', false);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(buildLoginRedirectPath(LOGIN_FEEDBACK_MESSAGE));
  }

  if (!isAdminUser(data.user)) {
    await supabase.auth.signOut();
    return redirect(buildLoginRedirectPath());
  }

  revalidatePath('/', 'layout');
  redirect('/admin');
}
