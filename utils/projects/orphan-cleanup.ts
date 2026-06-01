import type { SupabaseClient } from '@supabase/supabase-js';
import { PROJECTS_BUCKET, PROJECTS_TABLE } from '@/utils/projects/constants';
import { getProjectImageStoragePath } from '@/utils/projects/storage-helpers';

export type OrphanCleanupResult = {
  deleted: number;
  errors: string[];
};

type StorageListItem = { name: string; id?: string | null };
type ProjectRow = { image_url: string | null };

function isFileEntry(entry: StorageListItem): boolean {
  return entry.id != null;
}

export async function cleanupOrphanProjectImages(
  supabase: SupabaseClient,
): Promise<OrphanCleanupResult> {
  const { data: files, error: listError } = await supabase.storage
    .from(PROJECTS_BUCKET)
    .list();

  if (listError) {
    return { deleted: 0, errors: [`Failed to list storage: ${listError.message}`] };
  }

  const fileEntries = (files ?? []).filter(isFileEntry);
  if (fileEntries.length === 0) {
    return { deleted: 0, errors: [] };
  }

  const { data: projects, error: queryError } = await supabase
    .from(PROJECTS_TABLE)
    .select('image_url');

  if (queryError) {
    return { deleted: 0, errors: [`Failed to query projects: ${queryError.message}`] };
  }

  const referencedPaths = new Set<string>();
  for (const project of (projects ?? []) as ProjectRow[]) {
    const imageUrl = project.image_url;
    if (!imageUrl) {
      continue;
    }
    const path = getProjectImageStoragePath(imageUrl);
    if (path) {
      referencedPaths.add(path);
    }
  }

  const orphanPaths = fileEntries
    .map((file) => file.name)
    .filter((name) => !referencedPaths.has(name));

  if (orphanPaths.length === 0) {
    return { deleted: 0, errors: [] };
  }

  const { error: removeError } = await supabase.storage
    .from(PROJECTS_BUCKET)
    .remove(orphanPaths);

  if (removeError) {
    return { deleted: 0, errors: [`Failed to remove orphans: ${removeError.message}`] };
  }

  return { deleted: orphanPaths.length, errors: [] };
}
