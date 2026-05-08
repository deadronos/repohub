'use client';

import { Search } from 'lucide-react';
import type { Project } from '@/types';
import { extractAllTags, formatTagLabel } from '@/utils/projects/tags';

type FilterBarProps = {
  projects: Project[];
  activeTags: Set<string>;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

const ACTIVE_PILL =
  'bg-cyan-500/20 border-cyan-500 text-cyan-200';
const INACTIVE_PILL =
  'bg-zinc-800/40 border-zinc-700/50 text-zinc-400';

export default function FilterBar({
  projects,
  activeTags,
  toggleTag,
  clearFilters,
  searchQuery,
  setSearchQuery,
}: FilterBarProps) {
  const allTags = extractAllTags(projects);
  const isAllActive = activeTags.size === 0;

  return (
    <div className="glass-panel flex items-center gap-3 rounded-2xl border border-white/10 p-3 shadow-[0_0_40px_rgba(2,8,23,0.45)] md:p-4">
      <div className="flex flex-1 items-center gap-2 overflow-x-auto scrollbar-hide">
        <button
          type="button"
          onClick={clearFilters}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-200 hover:opacity-90 ${
            isAllActive ? ACTIVE_PILL : INACTIVE_PILL
          }`}
        >
          All
        </button>

        {allTags.map(({ tag, count }) => {
          const isActive = activeTags.has(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-200 hover:opacity-90 ${
                isActive ? ACTIVE_PILL : INACTIVE_PILL
              }`}
            >
              {formatTagLabel(tag)} ({count})
            </button>
          );
        })}
      </div>

      <div className="relative flex shrink-0 items-center">
        <Search
          data-testid="search-icon"
          className="pointer-events-none absolute left-2.5 h-4 w-4 text-zinc-500"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects..."
          className="h-9 w-40 rounded-full border border-white/10 bg-white/[0.03] pl-8 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 backdrop-blur-sm transition-all duration-200 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 md:w-56"
        />
      </div>
    </div>
  );
}
