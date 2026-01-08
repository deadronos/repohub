'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Grid, CellComponentProps } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import type { Project } from '@/types';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import { useEscapeKey } from '@/utils/hooks/useEscapeKey';

type ProjectGalleryProps = {
  projects: Project[];
};

type ItemData = {
  projects: Project[];
  columns: number;
  onProjectClick: (id: string) => void;
  gap: number;
};

export default function ProjectGallery({ projects }: ProjectGalleryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEscapeKey(() => setSelectedId(null), Boolean(selectedId));

  const selectedProject = useMemo(
    () => (selectedId ? projects.find((project) => project.id === selectedId) ?? null : null),
    [selectedId, projects]
  );

  const GAP = 24; // gap-6

  // Cell Component
  const Cell = ({ columnIndex, rowIndex, style, projects, columns, onProjectClick, gap }: CellComponentProps<ItemData>) => {
    const index = rowIndex * columns + columnIndex;

    if (index >= projects.length) {
      return null;
    }

    const project = projects[index];

    const adjustedStyle = {
      ...style,
      width: Number(style.width) - gap,
      height: Number(style.height) - gap,
    };

    return (
      <div style={adjustedStyle}>
        <ProjectCard project={project} onClick={onProjectClick} />
      </div>
    );
  };

  return (
    <>
      <div className="w-full h-[800px] p-4 md:p-8">
        <AutoSizer renderProp={({ height, width }) => {
            // AutoSizer passes undefined height/width initially during SSR/first render
            if (height === undefined || width === undefined) {
                return null;
            }

            let columns = 1;
            if (width >= 1024) columns = 3;
            else if (width >= 768) columns = 2;

            const columnWidth = width / columns;
            const rowHeight = 320 + GAP;
            const rowCount = Math.ceil(projects.length / columns);

            return (
              <Grid
                columnCount={columns}
                columnWidth={columnWidth}
                rowCount={rowCount}
                rowHeight={rowHeight}
                style={{ height, width }}
                cellComponent={Cell}
                cellProps={{ projects, columns, onProjectClick: setSelectedId, gap: GAP }}
                className="scrollbar-hide"
              />
            );
          }}
        />
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
