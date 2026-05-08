import { ProjectTagsInput, normalizeTags } from './tags';

export type ProjectType = 'Game' | 'Tool' | 'Experiment' | 'Other';

export const PROJECT_TYPE_RULES: Record<ProjectType, string[]> = {
  Game: ['react-three-fiber', 'three.js', 'webgl', 'game', 'r3f'],
  Tool: ['docker', 'cli', 'sdk', 'api', 'tool'],
  Experiment: ['experiment', 'demo', 'prototype', 'mcp'],
  Other: [],
};

function matchesCategory(tag: string, keywords: string[]): boolean {
  const lowerTag = tag.toLowerCase();
  return keywords.some((keyword) => lowerTag.includes(keyword.toLowerCase()));
}

function inferType(tags: string[]): ProjectType {
  if (tags.length === 0) return 'Other';

  const categories: ProjectType[] = ['Game', 'Tool', 'Experiment'];
  for (const category of categories) {
    for (const tag of tags) {
      if (matchesCategory(tag, PROJECT_TYPE_RULES[category])) {
        return category;
      }
    }
  }

  return 'Other';
}

export function inferProjectType(tags: ProjectTagsInput): ProjectType {
  const normalized = normalizeTags(tags);
  return inferType(normalized);
}
