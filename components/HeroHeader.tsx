import { Github } from 'lucide-react';

export default function HeroHeader() {
  return (
    <header className="mb-12 text-center relative z-10 flex flex-col items-center">
      <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-6 tracking-tight drop-shadow-sm pb-2 text-glow">
        PROJECT HUB
      </h1>
      <p className="text-zinc-300 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
        Exploring the digital frontier. A curated showcase of web experiments, immersive games, and open-source repositories.
      </p>

      <a
        href="https://github.com/deadronos"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-300 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-white border border-zinc-700/50 hover:border-zinc-500 backdrop-blur-sm group hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-105"
        aria-label="Visit GitHub Profile"
      >
        <Github className="w-5 h-5 transition-transform group-hover:rotate-12" />
        <span>@deadronos</span>
      </a>
    </header>
  );
}
