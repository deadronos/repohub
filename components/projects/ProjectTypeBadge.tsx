'use client';

import { Gamepad2, Wrench, FlaskConical, Sparkles } from 'lucide-react';
import type { ProjectType } from '@/utils/projects/projectType';

const STYLES: Record<ProjectType, { container: string; tag: string }> = {
  Game: {
    container: 'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border backdrop-blur-md',
    tag: 'text-cyan-300 border-cyan-500/30 bg-cyan-900/30',
  },
  Tool: {
    container: 'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border backdrop-blur-md',
    tag: 'text-amber-300 border-amber-500/30 bg-amber-900/30',
  },
  Experiment: {
    container: 'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border backdrop-blur-md',
    tag: 'text-violet-300 border-violet-500/30 bg-violet-900/30',
  },
  Other: {
    container: 'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border backdrop-blur-md',
    tag: 'text-zinc-300 border-zinc-500/30 bg-zinc-800/30',
  },
};

const ICONS: Record<ProjectType, typeof Gamepad2> = {
  Game: Gamepad2,
  Tool: Wrench,
  Experiment: FlaskConical,
  Other: Sparkles,
};

type ProjectTypeBadgeProps = {
  type: ProjectType | null | undefined;
};

export default function ProjectTypeBadge({ type }: ProjectTypeBadgeProps) {
  if (type == null) {
    return null;
  }

  const Icon = ICONS[type];
  const styles = STYLES[type];

  return (
    <span className={`${styles.container} ${styles.tag}`}>
      <Icon size={12} />
      {type}
    </span>
  );
}