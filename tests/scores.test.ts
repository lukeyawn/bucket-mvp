import { describe, expect, it } from 'vitest';
import { friendsAverage, scoreAt, scoreIn } from '../src/lib/scores';
import type { Friend, TierRanking } from '../src/lib/types';

describe('scores (goal 3)', () => {
  it('spans each band from top to bottom', () => {
    expect(scoreAt('loved', 0, 5)).toBe(10.0);
    expect(scoreAt('loved', 4, 5)).toBe(6.7);
    expect(scoreAt('okay', 0, 3)).toBe(6.6);
    expect(scoreAt('okay', 2, 3)).toBe(3.4);
    expect(scoreAt('disliked', 0, 2)).toBe(3.3);
    expect(scoreAt('disliked', 1, 2)).toBe(0.0);
  });

  it('gives a group of one the top of its band', () => {
    expect(scoreAt('loved', 0, 1)).toBe(10.0);
    expect(scoreAt('okay', 0, 1)).toBe(6.6);
    expect(scoreAt('disliked', 0, 1)).toBe(3.3);
  });

  it('rounds to one decimal', () => {
    // 10 - 3.3 * 1/6 = 9.45 -> 9.5 (or 9.4 with float error); must be one decimal either way
    const s = scoreAt('loved', 1, 7);
    expect(Math.round(s * 10) / 10).toBe(s);
    expect(scoreAt('loved', 1, 4)).toBe(8.9); // 10 - 1.1
    expect(scoreAt('okay', 1, 4)).toBe(5.5); // 6.6 - 1.0667
  });

  it('finds a place in any group', () => {
    const r: TierRanking = { tier: 'local', groups: { loved: ['a', 'b'], okay: ['c'], disliked: [] } };
    expect(scoreIn(r, 'b')).toBe(6.7);
    expect(scoreIn(r, 'c')).toBe(6.6);
    expect(scoreIn(r, 'x')).toBeNull();
  });
});

describe("friends' average", () => {
  const friend = (id: string, loved: string[], okay: string[] = [], disliked: string[] = []): Friend => ({
    id,
    name: id.toUpperCase(),
    rankings: [{ tier: 'local', groups: { loved, okay, disliked } }],
  });

  it('is null with no friends who ranked the place', () => {
    expect(friendsAverage([], 'p')).toBeNull();
    expect(friendsAverage([friend('a', ['q'])], 'p')).toBeNull();
  });

  it('is the friend score with one friend', () => {
    expect(friendsAverage([friend('a', ['p'])], 'p')).toEqual({ average: 10, count: 1, names: ['A'] });
  });

  it('averages several friends and counts only those who ranked it', () => {
    const friends = [friend('a', ['p']), friend('b', [], ['p']), friend('c', [], [], ['x', 'p']), friend('d', ['x'])];
    // 10.0, 6.6, 0.0 -> 5.533 -> 5.5
    expect(friendsAverage(friends, 'p')).toEqual({ average: 5.5, count: 3, names: ['A', 'B', 'C'] });
  });
});
