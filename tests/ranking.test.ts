import { describe, expect, it } from 'vitest';
import {
  answer,
  currentMid,
  displayRank,
  emptyRanking,
  expectedComparisons,
  insertPosition,
  startInsert,
  undo,
  withInserted,
} from '../src/lib/ranking';

// Simulates a user who always answers truthfully about a new place that belongs at `target`.
function runInsert(n: number, target: number) {
  let state = startInsert(n);
  let comparisons = 0;
  while (!state.done) {
    const mid = currentMid(state);
    state = answer(state, target <= mid ? 'new' : 'existing');
    comparisons++;
  }
  return { position: insertPosition(state), comparisons };
}

describe('binary insertion (goal 2)', () => {
  it('lands in every position of groups sized 0 to 15 within 4 comparisons', () => {
    for (let n = 0; n <= 15; n++) {
      for (let target = 0; target <= n; target++) {
        const { position, comparisons } = runInsert(n, target);
        expect(position).toBe(target);
        expect(comparisons).toBeLessThanOrEqual(4);
        expect(comparisons).toBeLessThanOrEqual(expectedComparisons(n));
      }
    }
  });

  it('needs no comparisons for an empty group', () => {
    const state = startInsert(0);
    expect(state.done).toBe(true);
    expect(insertPosition(state)).toBe(0);
  });

  it('takes exactly 3 comparisons in a group of 7, wherever the place lands', () => {
    for (let target = 0; target <= 7; target++) {
      expect(runInsert(7, target).comparisons).toBe(3);
    }
  });

  it('reports the progress estimate', () => {
    expect([0, 1, 2, 3, 7, 8, 15].map(expectedComparisons)).toEqual([0, 1, 2, 2, 3, 4, 4]);
  });

  it('places a "too tough to call" right at mid and stops', () => {
    let state = startInsert(7);
    state = answer(state, 'existing'); // lo = 4, hi = 7, mid = 5
    expect(currentMid(state)).toBe(5);
    state = answer(state, 'tie');
    expect(state.done).toBe(true);
    expect(insertPosition(state)).toBe(5);
  });

  it('undo reverts the last answer', () => {
    const start = startInsert(7);
    const once = answer(start, 'new');
    const twice = answer(once, 'existing');
    const undone = undo(twice)!;
    expect(undone.lo).toBe(once.lo);
    expect(undone.hi).toBe(once.hi);
    expect(undone.history).toHaveLength(1);
    expect(currentMid(undone)).toBe(currentMid(once));
  });

  it('undo after a finishing answer reopens the comparison', () => {
    let state = startInsert(1);
    state = answer(state, 'existing');
    expect(state.done).toBe(true);
    const undone = undo(state)!;
    expect(undone.done).toBe(false);
    expect(currentMid(undone)).toBe(0);
  });

  it('undo on the first comparison returns to the sentiment choice', () => {
    expect(undo(startInsert(5))).toBeNull();
  });
});

describe('ranking helpers', () => {
  it('inserts into a group and computes the display rank across groups', () => {
    let r = emptyRanking('local');
    r = withInserted(r, 'loved', 'a', 0);
    r = withInserted(r, 'loved', 'b', 1);
    r = withInserted(r, 'okay', 'c', 0);
    r = withInserted(r, 'loved', 'd', 1);
    expect(r.groups.loved).toEqual(['a', 'd', 'b']);
    expect(displayRank(r, 'c')).toEqual({ rank: 4, of: 4 });
    expect(displayRank(r, 'd')).toEqual({ rank: 2, of: 4 });
    expect(displayRank(r, 'zzz')).toBeNull();
  });
});
