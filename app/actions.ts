'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  // Type-casting here for simplicity, but valid zod validation is better in production
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

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

export async function createProject(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const title = formData.get('title') as string;
  const short_description = formData.get('short_description') as string;
  const description = formData.get('description') as string;
  const repo_url = formData.get('repo_url') as string;
  const demo_url = formData.get('demo_url') as string;
  const tagsStr = formData.get('tags') as string;
  const tags = tagsStr.split(',').map((t) => t.trim());

  const imageFile = formData.get('image') as File;
  let image_url = '';

  if (imageFile && imageFile.size > 0) {
    const filename = `${Date.now()}-${imageFile.name}`;
    const { data, error } = await supabase.storage.from('projects').upload(filename, imageFile, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('Upload error:', error);
      // handle error
    } else if (data) {
      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('projects').getPublicUrl(data.path);
      image_url = publicUrl;
    }
  }

  const { error } = await supabase.from('projects').insert({
    title,
    short_description,
    description,
    repo_url,
    demo_url,
    tags,
    image_url,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Database error:', error);
    return { error: 'Failed' };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function updateProject(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const short_description = formData.get('short_description') as string;
  const description = formData.get('description') as string;
  const repo_url = formData.get('repo_url') as string;
  const demo_url = formData.get('demo_url') as string;
  const tagsStr = formData.get('tags') as string;
  const tags = tagsStr.split(',').map((t) => t.trim());

  const imageFile = formData.get('image') as File;
  let image_url = formData.get('current_image_url') as string;

  if (imageFile && imageFile.size > 0) {
    const filename = `${Date.now()}-${imageFile.name}`;
    const { data, error } = await supabase.storage.from('projects').upload(filename, imageFile, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('Upload error:', error);
    } else if (data) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('projects').getPublicUrl(data.path);
      image_url = publicUrl;
    }
  }

  const { error } = await supabase
    .from('projects')
    .update({
      title,
      short_description,
      description,
      repo_url,
      demo_url,
      tags,
      image_url,
    })
    .eq('id', id);

  if (error) {
    console.error('Database error:', error);
    return { error: 'Failed' };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteProjects(ids: string[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase.from('projects').delete().in('id', ids);

  if (error) {
    console.error('Database error:', error);
    return { error: 'Failed' };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}
