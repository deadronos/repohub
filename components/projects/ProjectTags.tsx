'use client';

import type { Project } from '@/types';
import { formatTagLabel, getVisibleTags, normalizeTags } from '@/utils/projects/tags';

type Variant = 'card' | 'modal' | 'admin';

type ProjectTagsProps = {
  tags: Project['tags'];
  variant: Variant;
  limit?: number;
  emptyLabel?: string;
};

const STYLES: Record<Variant, { container: string; tag: string }> = {
  card: {
    container: 'flex gap-2 mt-3 flex-wrap',
    tag: 'text-xs bg-cyan-900/30 border border-cyan-500/30 text-cyan-200 px-2 py-1 rounded-full backdrop-blur-md',
  },
  modal: {
    container: 'flex gap-2 mt-3 flex-wrap',
    tag: 'text-xs border border-cyan-900 text-cyan-300 bg-cyan-950/30 px-2 py-1 rounded-full',
  },
  admin: {
    container: 'flex gap-1 mt-2',
    tag: 'text-xs text-zinc-600 border border-zinc-800 px-2 py-0.5 rounded',
  },
};

export default function ProjectTags({ tags, variant, limit, emptyLabel }: ProjectTagsProps) {
  const safeTags = limit === undefined ? normalizeTags(tags) : getVisibleTags(tags, limit);

  if (safeTags.length === 0) {
    if (!emptyLabel) {
      return null;
    }

    const styles = STYLES[variant];
    return (
      <div className={styles.container}>
        <span className={styles.tag}>{emptyLabel}</span>
      </div>
    );
  }

  const styles = STYLES[variant];
  return (
    <div className={styles.container}>
      {safeTags.map((tag) => (
        <span key={tag} className={styles.tag}>
          {formatTagLabel(tag)}
        </span>
      ))}
    </div>
  );
}
