import { Link } from 'lucide-react';

type HeroHeaderProps = {
  projectCount: number;
  featuredCount: number;
  latestProjectLabel: string;
  topTag: string;
};

export default function HeroHeader({
  projectCount,
  featuredCount,
  latestProjectLabel,
  topTag,
}: HeroHeaderProps) {
  return (
    <header className="relative grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] lg:items-end">
      <div className="space-y-7 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.85)]" />
          Live experiments & digital builds
        </div>

        <div className="mx-auto max-w-4xl lg:mx-0">
          <h1 className="pb-2 text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 drop-shadow-sm md:text-7xl text-glow">
            PROJECT HUB
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300 md:text-lg">
            A curated archive of playable experiments, immersive 3D ideas, and open-source tools.
            Built for fast scanning, deep dives, and desktop-first exploration.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
          <a
            href="#projects"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-cyan-400 hover:shadow-[0_0_28px_rgba(34,211,238,0.38)]"
          >
            Explore projects
          </a>

          <a
            href="https://github.com/deadronos"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700/70 bg-zinc-900/35 px-6 py-3 text-sm font-medium text-zinc-200 backdrop-blur-sm transition-all duration-300 hover:border-zinc-500 hover:bg-zinc-800/65 hover:text-white"
            aria-label="Visit GitHub Profile"
          >
            <Link className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
            @deadronos
          </a>
        </div>
      </div>

      <aside className="glass-panel rounded-3xl border border-white/10 p-5 shadow-[0_0_40px_rgba(2,8,23,0.45)] md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
          At a glance
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.26em] text-zinc-500">Projects</dt>
            <dd className="mt-2 text-3xl font-semibold text-white">{projectCount}</dd>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.26em] text-zinc-500">Featured</dt>
            <dd className="mt-2 text-3xl font-semibold text-white">{featuredCount}</dd>
          </div>

          <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.26em] text-zinc-500">Newest drop</dt>
            <dd className="mt-2 text-lg font-medium text-zinc-100">{latestProjectLabel}</dd>
          </div>

          <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.26em] text-zinc-500">Top tag</dt>
            <dd className="mt-2 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-100">
              {topTag}
            </dd>
          </div>
        </dl>
      </aside>
    </header>
  );
}
