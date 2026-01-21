import type { DragEndEvent } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import { vi } from 'vitest';

type DndContextProps = { onDragEnd?: (event: DragEndEvent) => void | Promise<void> };

let latestDndContextProps: DndContextProps | null = null;
let useSortableArgs: Array<{ id: string; disabled?: boolean }> = [];
const refreshSpy = vi.fn();

export function getLatestDndContextProps() {
  return latestDndContextProps;
}

export function getUseSortableArgs() {
  return useSortableArgs;
}

export function getRefreshSpy() {
  return refreshSpy;
}

export function resetAdminDashboardMocks() {
  latestDndContextProps = null;
  useSortableArgs = [];
  refreshSpy.mockReset();
}

export function createDndKitCoreMock() {
  return {
    DndContext: ({ children, ...props }: { children: ReactNode }) => {
      latestDndContextProps = props;
      return <div data-testid="dnd-context">{children}</div>;
    },
    DragOverlay: ({ children }: { children: ReactNode }) => (
      <div data-testid="drag-overlay">{children}</div>
    ),
    KeyboardSensor: function KeyboardSensor() {},
    PointerSensor: function PointerSensor() {},
    closestCenter: () => undefined,
    useSensor: (_sensor: unknown, options: unknown) => ({ _sensor, options }),
    useSensors: (...sensors: unknown[]) => sensors,
  };
}

export function createDndKitSortableMock() {
  return {
    SortableContext: ({ children }: { children: ReactNode }) => (
      <div data-testid="sortable-context">{children}</div>
    ),
    arrayMove: <T,>(array: T[], from: number, to: number) => {
      const copy = array.slice();
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    },
    rectSortingStrategy: () => undefined,
    sortableKeyboardCoordinates: () => undefined,
    useSortable: (args: { id: string; disabled?: boolean }) => {
      useSortableArgs.push({ id: String(args.id), disabled: args.disabled });
      return {
        attributes: {},
        listeners: {},
        setNodeRef: () => undefined,
        setActivatorNodeRef: () => undefined,
        transform: null,
        transition: undefined,
        isDragging: false,
      };
    },
  };
}

export function createDndKitUtilitiesMock() {
  return {
    CSS: {
      Transform: {
        toString: () => '',
      },
    },
  };
}
