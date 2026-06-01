import { revalidatePath, revalidateTag } from 'next/cache';
import { PROJECTS_CACHE_TAG } from '@/utils/projects/constants';

export function revalidateProjects(): void {
  revalidateTag(PROJECTS_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin');
}
