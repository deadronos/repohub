'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getFormString } from '@/utils/form';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = getFormString(formData, 'email');
  const password = getFormString(formData, 'password', false);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect('/login?message=Could not authenticate user');
  }

  revalidatePath('/', 'layout');
  redirect('/admin');
}
