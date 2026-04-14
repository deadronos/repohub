import { getCachedProjects } from '@/utils/projects/queries';
import HeroHeader from '@/components/HeroHeader';
import HomepageAtmosphere from '@/components/HomepageAtmosphere';
import dynamic from 'next/dynamic';
import type { Project } from '@/types';

const ProjectGallery = dynamic(() => import('@/components/ProjectGallery'), {
  loading: () => (
    <div className="w-full h-[800px] p-4 md:p-8">
      <div className="w-full h-full bg-zinc-900/20 rounded-xl animate-pulse border border-zinc-800/50" />
    </div>
  ),
});

export default async function Home() {
  const projects = await getCachedProjects();
  const featuredProjects = projects.filter((project) => project.is_featured).length;

  const latestProject = projects.reduce<Project | null>((latest, project) => {
    if (!latest) return project;

    return project.created_at > latest.created_at ? project : latest;
  }, null);

  const tagFrequency = new Map<string, number>();
  for (const project of projects) {
    const tags = project.tags;
    if (tags) {
      for (const tag of tags) {
        tagFrequency.set(tag, (tagFrequency.get(tag) ?? 0) + 1);
      }
    }
  }

  const topTag = [...tagFrequency.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Open source';
  const latestProjectLabel = latestProject
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(latestProject.created_at))
    : 'No projects yet';

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8 md:px-10 md:py-10 lg:px-12">
      <HomepageAtmosphere />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-16 md:gap-20">
        <HeroHeader
          projectCount={projects.length}
          featuredCount={featuredProjects}
          latestProjectLabel={latestProjectLabel}
          topTag={topTag}
        />

        <section id="projects" className="space-y-6 scroll-mt-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/70">
                Selected work
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                Browse the archive
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-relaxed text-zinc-400 md:text-right">
              Open any project card for a deeper look at the demo, source, and the tech stack behind
              it.
            </p>
          </div>

          <ProjectGallery projects={projects} />
        </section>
      </div>

      {!projects.length && (
        <div className="text-center text-zinc-500 mt-20">
          <p>No projects found. Time to build something.</p>
        </div>
      )}
    </main>
  );
}
