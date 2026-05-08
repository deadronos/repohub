'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Project } from '@/types';
import ProjectCard from '@/components/ProjectCard';
import ScrollReveal from '@/components/projects/ScrollReveal';

type AnimatedProjectGridProps = {
  projects: Project[];
  onProjectClick: (id: string) => void;
};

export default function AnimatedProjectGrid({ projects, onProjectClick }: AnimatedProjectGridProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {projects.map((project) => (
          <ScrollReveal key={project.id}>
            <motion.div
              layoutId={project.id}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <ProjectCard project={project} onClick={onProjectClick} />
            </motion.div>
          </ScrollReveal>
        ))}
      </AnimatePresence>
    </div>
  );
}