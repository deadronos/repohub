import { createClient } from '@/utils/supabase/server';
import { createStaticClient } from '@/utils/supabase/static';
import type { Project } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { PROJECTS_CACHE_TAG, PROJECTS_TABLE } from '@/utils/projects/constants';

async function fetchProjectsOrdered(supabase: SupabaseClient): Promise<Project[]> {
  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }

  return (data as Project[]) ?? [];
}

export async function listProjects(): Promise<Project[]> {
  const supabase = await createClient();
  return fetchProjectsOrdered(supabase);
}

export const getCachedProjects = unstable_cache(
  async () => {
    const supabase = createStaticClient();
    return fetchProjectsOrdered(supabase);
  },
  [PROJECTS_CACHE_TAG],
  { revalidate: 60, tags: [PROJECTS_CACHE_TAG] },
);
