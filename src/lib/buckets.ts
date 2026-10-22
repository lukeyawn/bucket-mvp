import type { PlaceList } from './types';

export interface ListProgress {
  list: PlaceList;
  collected: number;
  total: number;
}

export function progressOf(list: PlaceList, isCollected: (placeId: string) => boolean): ListProgress {
  return { list, collected: list.placeIds.filter(isCollected).length, total: list.placeIds.length };
}

/**
 * When a collect affects several buckets, one plays the full animation (section 5).
 * Priority: a list that just completed, then the list the user opened this place from,
 * then the list closest to complete. `after` is each affected list's progress including the new collect.
 */
export function pickAnimatedList(after: ListProgress[], fromListId: string | null): ListProgress | null {
  if (after.length === 0) return null;
  const completed = after.find((p) => p.collected === p.total);
  if (completed) return completed;
  const from = after.find((p) => p.list.id === fromListId);
  if (from) return from;
  return [...after].sort((a, b) => b.collected / b.total - a.collected / a.total || a.total - b.total)[0];
}
