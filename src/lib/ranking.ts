import type { Sentiment, Tier, TierRanking } from './types';
import { SENTIMENTS } from './types';

// Binary insertion of a new place into one sentiment group (section 7).
// The state is immutable so the UI can keep it in React state and undo freely.

export type Answer = 'new' | 'existing' | 'tie';

export interface InsertState {
  lo: number;
  hi: number;
  history: { lo: number; hi: number }[]; // states before each answer, for undo
  done: boolean;
}

export function startInsert(groupSize: number): InsertState {
  return { lo: 0, hi: groupSize, history: [], done: groupSize === 0 };
}

/** Index in the group of the place the new one is compared against. */
export function currentMid(state: InsertState): number {
  return Math.floor((state.lo + state.hi) / 2);
}

export function answer(state: InsertState, a: Answer): InsertState {
  if (state.done) return state;
  const mid = currentMid(state);
  const history = [...state.history, { lo: state.lo, hi: state.hi }];
  if (a === 'tie') return { lo: mid, hi: mid, history, done: true };
  const next = a === 'new' ? { lo: state.lo, hi: mid } : { lo: mid + 1, hi: state.hi };
  return { ...next, history, done: next.lo >= next.hi };
}

/** Reverts the last answer. Returns null when there is nothing to undo (back to the sentiment choice). */
export function undo(state: InsertState): InsertState | null {
  const prev = state.history[state.history.length - 1];
  if (!prev) return null;
  return { lo: prev.lo, hi: prev.hi, history: state.history.slice(0, -1), done: false };
}

/** Final insertion index once done. */
export function insertPosition(state: InsertState): number {
  return state.lo;
}

/** Upper bound on comparisons for a group of n places: ceil(log2(n + 1)). */
export function expectedComparisons(n: number): number {
  return Math.ceil(Math.log2(n + 1));
}

export function emptyRanking(tier: Tier): TierRanking {
  return { tier, groups: { loved: [], okay: [], disliked: [] } };
}

export function withInserted(ranking: TierRanking, sentiment: Sentiment, placeId: string, index: number): TierRanking {
  const groups = { ...ranking.groups };
  for (const s of SENTIMENTS) groups[s] = groups[s].filter((id) => id !== placeId);
  const group = [...groups[sentiment]];
  group.splice(Math.min(index, group.length), 0, placeId);
  groups[sentiment] = group;
  return { ...ranking, groups };
}

/** The tier's full order: loved, then okay, then disliked. */
export function fullOrder(ranking: TierRanking): string[] {
  return [...ranking.groups.loved, ...ranking.groups.okay, ...ranking.groups.disliked];
}

export function sentimentOf(ranking: TierRanking, placeId: string): Sentiment | null {
  return SENTIMENTS.find((s) => ranking.groups[s].includes(placeId)) ?? null;
}

/** 1-based display rank in the tier's full order, or null if unranked. */
export function displayRank(ranking: TierRanking, placeId: string): { rank: number; of: number } | null {
  const order = fullOrder(ranking);
  const i = order.indexOf(placeId);
  return i === -1 ? null : { rank: i + 1, of: order.length };
}
