import { createClient } from '@/utils/supabase/server';
import { createStaticClient } from '@/utils/supabase/static';
import type { Project } from '@/types';
import { unstable_cache } from 'next/cache';

export async function listProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }

  return (data as Project[]) ?? [];
}

export const getCachedProjects = unstable_cache(
  async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch projects (cached):', error);
      return [];
    }

    return (data as Project[]) ?? [];
  },
  ['projects'],
  { revalidate: 60, tags: ['projects'] },
);
