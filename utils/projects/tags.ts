import { capitalize } from '@/utils/string';
import type { Project } from '@/types';

export type ProjectTagsInput = string[] | null | undefined;

export function normalizeTags(tags: ProjectTagsInput): string[] {
  return (tags ?? [])
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export interface TagCount {
  tag: string;
  count: number;
}

export function extractAllTags(projects: Project[] | null | undefined): TagCount[] {
  if (!projects) return [];

  const tagCounts = new Map<string, number>();

  for (const project of projects) {
    const tags = normalizeTags(project.tags);
    for (const tag of tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const result: TagCount[] = [];
  for (const [tag, count] of tagCounts) {
    result.push({ tag, count });
  }

  return result.sort((a, b) => a.tag.localeCompare(b.tag));
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
