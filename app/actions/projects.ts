'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { parseProjectFormData, validateProjectInput } from '@/utils/projects/form';
import { buildProjectOrderUpdates, validateProjectOrder } from '@/utils/projects/order';
import { uploadProjectImage } from '@/utils/projects/storage';

type ActionResult = { success: true } | { error: string };

const PROJECTS_TABLE = 'projects';

const revalidateProjects = () => {
  revalidatePath('/');
  revalidatePath('/admin');
};

const getUser = async (supabase: SupabaseClient) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

const getNextSortOrder = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Failed to fetch sort order:', error);
    return 1;
  }

  const currentMax = data?.[0]?.sort_order ?? 0;
  return currentMax + 1;
};

export async function createProject(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    redirect('/login');
  }

  const parsed = parseProjectFormData(formData);
  const validationErrors = validateProjectInput({
    title: parsed.title,
    repoUrl: parsed.repo_url,
    demoUrl: parsed.demo_url,
  });

  if (validationErrors.length > 0) {
    return { error: validationErrors.join(', ') };
  }

  const imageUrl = await uploadProjectImage(supabase, parsed.imageFile);
  const tags = parsed.tags.length > 0 ? parsed.tags : null;
  const sortOrder = await getNextSortOrder(supabase);

  const { error } = await supabase.from(PROJECTS_TABLE).insert({
    title: parsed.title,
    short_description: parsed.short_description,
    description: parsed.description,
    repo_url: parsed.repo_url,
    demo_url: parsed.demo_url,
    tags,
    image_url: imageUrl ?? '',
    created_at: new Date().toISOString(),
    sort_order: sortOrder,
  });

  if (error) {
    console.error('Database error:', error);
    return { error: 'Failed' };
  }

  revalidateProjects();
  return { success: true };
}

export async function updateProjectOrder(orderedIds: string[]): Promise<ActionResult> {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const validationError = validateProjectOrder(orderedIds);
  if (validationError) {
    return { error: validationError };
  }

  const updates = buildProjectOrderUpdates(orderedIds);
  const { error } = await supabase.from(PROJECTS_TABLE).upsert(updates, {
    onConflict: 'id',
  });

  if (error) {
    console.error('Database error:', error);
    return { error: 'Failed' };
  }

  revalidateProjects();
  return { success: true };
}

export async function updateProject(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const parsed = parseProjectFormData(formData);
  if (!parsed.id) {
    return { error: 'Missing project id' };
  }

  const validationErrors = validateProjectInput({
    title: parsed.title,
    repoUrl: parsed.repo_url,
    demoUrl: parsed.demo_url,
  });

  if (validationErrors.length > 0) {
    return { error: validationErrors.join(', ') };
  }

  const imageUrl = await uploadProjectImage(supabase, parsed.imageFile);
  const tags = parsed.tags.length > 0 ? parsed.tags : null;

  const { error } = await supabase
    .from(PROJECTS_TABLE)
    .update({
      title: parsed.title,
      short_description: parsed.short_description,
      description: parsed.description,
      repo_url: parsed.repo_url,
      demo_url: parsed.demo_url,
      tags,
      image_url: imageUrl ?? parsed.current_image_url,
    })
    .eq('id', parsed.id);

  if (error) {
    console.error('Database error:', error);
    return { error: 'Failed' };
  }

  revalidateProjects();
  return { success: true };
}

export async function deleteProjects(ids: string[]): Promise<ActionResult> {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase.from(PROJECTS_TABLE).delete().in('id', ids);

  if (error) {
    console.error('Database error:', error);
    return { error: 'Failed' };
  }

  revalidateProjects();
  return { success: true };
}
