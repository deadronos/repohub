import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Atomically gets the next sort_order by using a database function.
 * This avoids race conditions that can occur with SELECT max + 1 pattern.
 */
export async function getNextProjectSortOrder(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase.rpc('get_next_sort_order') as { data: number | null; error: Error | null };

  if (error) {
    console.error('Failed to fetch sort order:', error);
    throw new Error(`Failed to fetch sort order: ${error.message}`);
  }

  return data ?? 1;
}
