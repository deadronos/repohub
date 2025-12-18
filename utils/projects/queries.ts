import { createClient } from '@/utils/supabase/server';
import type { Project } from '@/types';

export async function listProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }

  return (data as Project[]) ?? [];
}
