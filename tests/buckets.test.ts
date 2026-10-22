import { describe, expect, it } from 'vitest';
import { pickAnimatedList, type ListProgress } from '../src/lib/buckets';

describe('which bucket animates', () => {
  const p = (id: string, collected: number, total: number): ListProgress => ({
    list: { id, name: id, description: '', kind: 'themed', placeIds: [] },
    collected,
    total,
  });

  it('prefers a list that just completed, then the list opened from, then the closest to complete', () => {
    expect(pickAnimatedList([p('a', 2, 6), p('b', 5, 5), p('c', 4, 5)], 'a')?.list.id).toBe('b');
    expect(pickAnimatedList([p('a', 2, 6), p('c', 4, 5)], 'a')?.list.id).toBe('a');
    expect(pickAnimatedList([p('a', 2, 6), p('c', 4, 5)], null)?.list.id).toBe('c');
    expect(pickAnimatedList([], null)).toBeNull();
  });
});
