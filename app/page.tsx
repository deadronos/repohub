import { getCachedProjects } from '@/utils/projects/queries';
import HeroHeader from '@/components/HeroHeader';
import dynamic from 'next/dynamic';

const ProjectGallery = dynamic(() => import('@/components/ProjectGallery'), {
  loading: () => (
    <div className="w-full h-[800px] p-4 md:p-8">
      <div className="w-full h-full bg-zinc-900/20 rounded-xl animate-pulse border border-zinc-800/50" />
    </div>
  ),
});

export default async function Home() {
  const projects = await getCachedProjects();

  return (
    <main className="min-h-screen p-8 md:p-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      <HeroHeader />

      <ProjectGallery projects={projects} />

      {!projects.length && (
        <div className="text-center text-zinc-500 mt-20">
          <p>No projects found. Time to build something.</p>
        </div>
      )}
    </main>
  );
}
