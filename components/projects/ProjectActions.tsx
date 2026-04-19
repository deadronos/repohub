import { ExternalLink, Link } from 'lucide-react';

type ProjectActionsProps = {
  demoUrl: string | null;
  repoUrl: string | null;
};

export default function ProjectActions({ demoUrl, repoUrl }: ProjectActionsProps) {
  if (!demoUrl && !repoUrl) return null;

  return (
    <div className="flex gap-4 flex-col sm:flex-row">
      {demoUrl && (
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]"
        >
          <ExternalLink size={18} /> Play / Demo
        </a>
      )}

      {repoUrl && (
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-zinc-700"
        >
          <Link size={18} /> View Code
        </a>
      )}
    </div>
  );
}
