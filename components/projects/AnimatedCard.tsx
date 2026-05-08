'use client';

import { useState, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { Project } from '@/types';
import ProjectCard from '@/components/ProjectCard';

type AnimatedCardProps = {
  project: Project;
  onClick: (projectId: string) => void;
};

export default function AnimatedCard({ project, onClick }: AnimatedCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (shouldReduceMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({
        rotateX: y * 10,
        rotateY: -x * 10,
      });
    },
    [shouldReduceMotion],
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  }, []);

  const transform = shouldReduceMotion
    ? undefined
    : `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`;

  return (
    <div
      className={`animated-card${isHovered ? ' animated-card--hovered' : ''}`}
      style={{
        ...(transform ? { transform } : {}),
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ProjectCard project={project} onClick={onClick} />
    </div>
  );
}