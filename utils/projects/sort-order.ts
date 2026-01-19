import type { SupabaseClient } from '@supabase/supabase-js';
import { PROJECTS_TABLE } from '@/utils/projects/constants';

export async function getNextProjectSortOrder(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .returns<{ sort_order: number }[]>();

  if (error) {
    console.error('Failed to fetch sort order:', error);
    return 1;
  }

  const currentMax = data?.[0]?.sort_order ?? 0;
  return currentMax + 1;
}
