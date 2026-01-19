import { revalidatePath } from 'next/cache';

export function revalidateProjects(): void {
  revalidatePath('/');
  revalidatePath('/admin');
}
