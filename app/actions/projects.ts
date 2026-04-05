'use server';

import { createClient } from '@/utils/supabase/server';
import { requireAdminOrUnauthorized } from '@/utils/supabase/auth';
import { prepareProjectMutation } from '@/utils/projects/mutations';
import { validateProjectOrder } from '@/utils/projects/order';
import { getNextProjectSortOrder } from '@/utils/projects/sort-order';
import { revalidateProjects } from '@/utils/projects/revalidate';
import { formatError, type ActionResult } from '@/utils/actions';
import { PROJECTS_TABLE } from '@/utils/projects/constants';
import { deleteProjectImages } from '@/utils/projects/storage';
import type { Project } from '@/types';

import type { ProjectFormData } from '@/utils/projects/form';
import type { SupabaseClient } from '@supabase/supabase-js';

type InitializeResult = {
  data: {
    parsed: ProjectFormData;
    imageUrl: string;
    tags: string[];
  };
};

async function initializeProjectMutation(supabase: SupabaseClient, formData: FormData) {
  const userResult = await requireAdminOrUnauthorized(supabase);
  if ('error' in userResult) {
    return userResult as { error: string };
  }

  const prepared = await prepareProjectMutation(supabase, formData);
  if ('error' in prepared) {
    return { error: prepared.error } as { error: string };
  }

  return { data: prepared.data as unknown as InitializeResult['data'] };
}

export async function createProject(formData: FormData): Promise<ActionResult<true>> {
  const supabase = await createClient();
  const initResult = await initializeProjectMutation(supabase, formData);
  if ('error' in initResult) {
    return { error: initResult.error };
  }
  if (!initResult.data) return { error: 'Unknown Error' };
  const { parsed, imageUrl, tags } = initResult.data;
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

    if (imageUrl) {
      await deleteProjectImages(supabase, [imageUrl]);
    }

    return { error: formatError(error) };
  }

  revalidateProjects();
  return { data: true };
}

export async function updateProjectOrder(orderedIds: string[]): Promise<ActionResult<true>> {
  const supabase = await createClient();
  const userResult = await requireAdminOrUnauthorized(supabase);
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

export async function setProjectsFeatured(
  ids: string[],
  isFeatured: boolean,
): Promise<ActionResult<true>> {
  const supabase = await createClient();
  const userResult = await requireAdminOrUnauthorized(supabase);
  if ('error' in userResult) {
    return userResult;
  }

  if (ids.length === 0) {
    return { error: 'Select at least one project' };
  }

  const { error } = await supabase
    .from(PROJECTS_TABLE)
    .update({ is_featured: isFeatured })
    .in('id', ids);

  if (error) {
    console.error('Database error:', error);
    return { error: formatError(error) };
  }

  revalidateProjects();
  return { data: true };
}

export async function updateProject(formData: FormData): Promise<ActionResult<true>> {
  const supabase = await createClient();
  const initResult = await initializeProjectMutation(supabase, formData);
  if ('error' in initResult) {
    return { error: initResult.error };
  }
  if (!initResult.data) return { error: 'Unknown Error' };
  const { parsed, imageUrl, tags } = initResult.data;
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
      image_url: imageUrl ?? (parsed.current_image_url ?? ''),
    })
    .eq('id', parsed.id);

  if (error) {
    console.error('Database error:', error);

    if (imageUrl) {
      await deleteProjectImages(supabase, [imageUrl]);
    }

    return { error: formatError(error) };
  }

  let warning: string | undefined;
  const replacedExistingImage = Boolean(imageUrl && parsed.current_image_url);

  if (replacedExistingImage) {
    const cleanupResult = await deleteProjectImages(supabase, [parsed.current_image_url]);
    if (cleanupResult.warning) {
      warning = 'Project updated, but failed to remove the previous image from storage.';
    }
  }

  revalidateProjects();
  return warning ? { data: true, warning } : { data: true };
}

export async function deleteProjects(ids: string[]): Promise<ActionResult<true>> {
  const supabase = await createClient();
  const userResult = await requireAdminOrUnauthorized(supabase);
  if ('error' in userResult) {
    return userResult;
  }

  const { data: projects, error: queryError } = await supabase
    .from(PROJECTS_TABLE)
    .select('id, image_url')
    .in('id', ids)
    .returns<Array<Pick<Project, 'id' | 'image_url'>>>();

  if (queryError) {
    console.error('Database error:', queryError);
    return { error: formatError(queryError) };
  }

  const { error } = await supabase.from(PROJECTS_TABLE).delete().in('id', ids);

  if (error) {
    console.error('Database error:', error);
    return { error: formatError(error) };
  }

  let warning: string | undefined;
  const cleanupResult = await deleteProjectImages(
    supabase,
    (projects ?? []).map((project) => project.image_url),
  );

  if (cleanupResult.warning) {
    warning = 'Projects deleted, but failed to remove some images from storage.';
  }

  revalidateProjects();
  return warning ? { data: true, warning } : { data: true };
}
