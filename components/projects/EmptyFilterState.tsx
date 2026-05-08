import { SearchX } from 'lucide-react';
import { formatTagLabel } from '@/utils/projects/tags';

interface EmptyFilterStateProps {
  activeTags: string[];
  searchQuery: string;
  onClearFilters: () => void;
}

function buildMessage(activeTags: string[], searchQuery: string): string {
  if (activeTags.length > 0 && searchQuery) {
    return `No projects match '${formatTagLabel(activeTags[0])}' and '${searchQuery}'`;
  }
  if (activeTags.length > 0) {
    return `No projects match '${formatTagLabel(activeTags[0])}'`;
  }
  if (searchQuery) {
    return `No projects match '${searchQuery}'`;
  }
  return 'No projects found';
}

export default function EmptyFilterState({
  activeTags,
  searchQuery,
  onClearFilters,
}: EmptyFilterStateProps) {
  return (
    <div className="glass-panel w-full mx-auto max-w-md flex flex-col items-center justify-center py-12 px-4 rounded-xl">
      <SearchX data-testid="search-icon" size={48} className="text-zinc-600 mb-4" />
      <h2 className="text-lg text-white mb-2">No projects found</h2>
      <p className="text-zinc-400 text-sm mb-6 text-center">{buildMessage(activeTags, searchQuery)}</p>
      <button
        onClick={onClearFilters}
        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg transition-colors"
      >
        Clear filters
      </button>
    </div>
  );
}
