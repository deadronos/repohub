'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Project } from '@/types';
import ProjectCard from '@/components/ProjectCard';

type AnimatedProjectGridProps = {
  projects: Project[];
  onProjectClick: (id: string) => void;
};

export default function AnimatedProjectGrid({ projects, onProjectClick }: AnimatedProjectGridProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence initial={false} mode="popLayout">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            layout
            initial={false}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <ProjectCard project={project} onClick={onProjectClick} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
