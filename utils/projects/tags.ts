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

  const tagCounts = new Map<string, { display: string; count: number }>();

  for (const project of projects) {
    const tags = normalizeTags(project.tags);
    for (const tag of tags) {
      const key = tag.toLowerCase();
      const entry = tagCounts.get(key);
      if (entry) {
        entry.count += 1;
      } else {
        tagCounts.set(key, { display: tag, count: 1 });
      }
    }
  }

  const result: TagCount[] = [];
  for (const { display, count } of tagCounts.values()) {
    result.push({ tag: display, count });
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
