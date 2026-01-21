'use server';

import { createClient } from '@/utils/supabase/server';
import { ensureUser, requireUserOrUnauthorized } from '@/utils/supabase/auth';
import { prepareProjectMutation } from '@/utils/projects/mutations';
import { validateProjectOrder } from '@/utils/projects/order';
import { getNextProjectSortOrder } from '@/utils/projects/sort-order';
import { revalidateProjects } from '@/utils/projects/revalidate';
import { formatError, type ActionResult } from '@/utils/actions';
import { PROJECTS_TABLE } from '@/utils/projects/constants';

export async function createProject(formData: FormData): Promise<ActionResult<true>> {
  const supabase = await createClient();
  await ensureUser(supabase, true);

  const prepared = await prepareProjectMutation(supabase, formData);
  if ('error' in prepared) {
    return { error: prepared.error };
  }

  const { parsed, imageUrl, tags } = prepared.data;
  const sortOrder = await getNextProjectSortOrder(supabase);

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
    return { error: formatError(error) };
  }

  revalidateProjects();
  return { data: true };
}

export async function updateProjectOrder(orderedIds: string[]): Promise<ActionResult<true>> {
  const supabase = await createClient();
  const userResult = await requireUserOrUnauthorized(supabase);
  if ('error' in userResult) {
    return userResult;
  }

  const validationError = validateProjectOrder(orderedIds);
  if (validationError) {
    return { error: validationError };
  }

  const { data: updatedCount, error: updateError } = await supabase
    .rpc('update_project_order', { ordered_ids: orderedIds })
    .returns<number>();

  if (updateError) {
    console.error('Database error:', updateError);
    return { error: formatError(updateError) };
  }

  if (typeof updatedCount !== 'number') {
    return { error: 'Failed' };
  }

  if (updatedCount !== orderedIds.length) {
    return { error: 'Project order contains unknown ids' };
  }

  revalidateProjects();
  return { data: true };
}

export async function updateProject(formData: FormData): Promise<ActionResult<true>> {
  const supabase = await createClient();
  const userResult = await requireUserOrUnauthorized(supabase);
  if ('error' in userResult) {
    return userResult;
  }

  const prepared = await prepareProjectMutation(supabase, formData);
  if ('error' in prepared) {
    return { error: prepared.error };
  }

  const { parsed, imageUrl, tags } = prepared.data;
  if (!parsed.id) {
    return { error: 'Missing project id' };
  }

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
    return { error: formatError(error) };
  }

  revalidateProjects();
  return { data: true };
}

export async function deleteProjects(ids: string[]): Promise<ActionResult<true>> {
  const supabase = await createClient();
  const userResult = await requireUserOrUnauthorized(supabase);
  if ('error' in userResult) {
    return userResult;
  }

  const { error } = await supabase.from(PROJECTS_TABLE).delete().in('id', ids);

  if (error) {
    console.error('Database error:', error);
    return { error: formatError(error) };
  }

  revalidateProjects();
  return { data: true };
}
