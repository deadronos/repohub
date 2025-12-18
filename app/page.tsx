import { listProjects } from '@/utils/projects/queries';
import ProjectGallery from '@/components/ProjectGallery';

export default async function Home() {
  const projects = await listProjects();

  return (
    <main className="min-h-screen p-8 md:p-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      <header className="mb-12 text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-4 tracking-tight drop-shadow-sm pb-2">
          PROJECT HUB
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          A curated collection of web experiments, games, and repositories.
        </p>
      </header>

      <ProjectGallery projects={projects} />

      {!projects.length && (
        <div className="text-center text-zinc-500 mt-20">
          <p>No projects found. Time to build something.</p>
        </div>
      )}
    </main>
  );
}
