import type { ComponentType, CSSProperties, ReactElement, ReactNode } from 'react';
import type { Project } from '@/types';

type MockCellProps = {
  columnIndex: number;
  rowIndex: number;
  style: CSSProperties;
  projects: Project[];
  columns: number;
  onProjectClick: (id: string) => void;
  gap: number;
};

type MockGridProps = {
  cellComponent: ComponentType<MockCellProps>;
  columnCount: number;
  rowCount: number;
  cellProps: {
    projects: Project[];
    columns: number;
    onProjectClick: (id: string) => void;
    gap: number;
  };
  style: CSSProperties;
};

type AutoSizerRenderProp = (size: { height: number; width: number }) => ReactElement | null;

type MockAutoSizerProps = {
  renderProp: AutoSizerRenderProp;
};

export function createGitHubStatsMock() {
  return {
    default: () => <div data-testid="github-stats-mock" />,
  };
}

export async function createFramerMotionMock(
  importOriginal: () => Promise<typeof import('framer-motion')>,
) {
  const actual = await importOriginal();
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
}

export function createReactWindowMock() {
  return {
    Grid: ({ cellComponent: Cell, columnCount, rowCount, cellProps, style }: MockGridProps) => {
      // Render all cells
      const cells: ReactElement[] = [];
      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
          const index = rowIndex * columnCount + columnIndex;
          if (index < cellProps.projects.length) {
            cells.push(
              <Cell
                key={`${rowIndex}-${columnIndex}`}
                columnIndex={columnIndex}
                rowIndex={rowIndex}
                style={{ width: 100, height: 100, ...style }}
                {...cellProps}
              />,
            );
          }
        }
      }
      return <div data-testid="virtual-grid-mock">{cells}</div>;
    },
  };
}

export function createAutoSizerMock() {
  return {
    AutoSizer: ({ renderProp }: MockAutoSizerProps) => {
      // Execute renderProp with fixed dimensions
      return renderProp({ height: 800, width: 1200 });
    },
  };
}
