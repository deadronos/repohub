export type ProjectOrderUpdate = {
  id: string;
  sort_order: number;
};

export function buildProjectOrderUpdates(
  ids: string[],
  startAt = 1,
): ProjectOrderUpdate[] {
  return ids.map((id, index) => ({
    id,
    sort_order: startAt + index,
  }));
}

export function validateProjectOrder(ids: string[]): string | null {
  if (ids.length === 0) {
    return 'No projects provided for ordering';
  }

  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    return 'Project order contains duplicate ids';
  }

  return null;
}
