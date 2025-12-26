import { capitalize } from '@/utils/string';

export type ProjectTagsInput = string[] | null | undefined;

export function normalizeTags(tags: ProjectTagsInput): string[] {
  return (tags ?? [])
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export function getVisibleTags(tags: ProjectTagsInput, limit: number): string[] {
  return normalizeTags(tags).slice(0, limit);
}

export function getPrimaryTag(tags: ProjectTagsInput): string | null {
  const [primary] = normalizeTags(tags);
  return primary ?? null;
}

export function formatTagLabel(tag: string): string {
  return capitalize(tag);
}
