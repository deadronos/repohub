'use client';

import type { CSSProperties } from 'react';
import { Grid, type CellComponentProps } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import type { Project } from '@/types';
import ProjectCard from '@/components/ProjectCard';

type ItemData = {
  projects: Project[];
  columns: number;
  onProjectClick: (id: string) => void;
  gap: number;
};

type VirtualizedProjectGridProps = {
  projects: Project[];
  onProjectClick: (id: string) => void;
};

const GAP = 24;

export default function VirtualizedProjectGrid({
  projects,
  onProjectClick,
}: VirtualizedProjectGridProps) {
  const Cell = ({
    columnIndex,
    rowIndex,
    style,
    projects,
    columns,
    onProjectClick,
    gap,
  }: CellComponentProps<ItemData>) => {
    const index = rowIndex * columns + columnIndex;

    if (index >= projects.length) {
      // Must return a ReactElement, null is not allowed by react-window types
      return <div style={style} />;
    }

    const project = projects[index];

    const adjustedStyle: CSSProperties = {
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
    <div className="w-full h-[800px] p-4 md:p-8">
      <AutoSizer
        renderProp={({ height, width }) => {
          // AutoSizer passes undefined height/width initially during SSR/first render
          if (height === undefined || width === undefined) {
            // Return a placeholder or null (but AutoSizer expects Node)
            // Returning null here is usually fine for React
            return <div style={{ height: 800, width: '100%' }} />;
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
              cellProps={{ projects, columns, onProjectClick, gap: GAP }}
              className="scrollbar-hide"
            />
          );
        }}
      />
    </div>
  );
}
