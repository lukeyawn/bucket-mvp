import type { Friend, Sentiment, TierRanking } from './types';
import { SENTIMENTS } from './types';

// Each ranked place gets a 0–10 score from its sentiment band and its position in that band (section 7).

export const BANDS: Record<Sentiment, { lo: number; hi: number }> = {
  loved: { lo: 6.7, hi: 10.0 },
  okay: { lo: 3.4, hi: 6.6 },
  disliked: { lo: 0.0, hi: 3.3 },
};

export function round1(x: number): number {
  return Math.round(x * 10) / 10;
}

/** Score of the place at index i (0 = best) in a group of size m. */
export function scoreAt(sentiment: Sentiment, i: number, m: number): number {
  const { lo, hi } = BANDS[sentiment];
  return round1(hi - ((hi - lo) * i) / Math.max(m - 1, 1));
}

export function scoreIn(ranking: TierRanking, placeId: string): number | null {
  for (const s of SENTIMENTS) {
    const group = ranking.groups[s];
    const i = group.indexOf(placeId);
    if (i !== -1) return scoreAt(s, i, group.length);
  }
  return null;
}

export function scoreInAny(rankings: TierRanking[], placeId: string): number | null {
  for (const r of rankings) {
    const s = scoreIn(r, placeId);
    if (s !== null) return s;
  }
  return null;
}

export interface FriendsAverage {
  average: number; // rounded to 1 decimal
  count: number;
  names: string[];
}

/** Mean score across friends who have ranked the place, or null if none have. */
export function friendsAverage(friends: Friend[], placeId: string): FriendsAverage | null {
  const scores: number[] = [];
  const names: string[] = [];
  for (const f of friends) {
    const s = scoreInAny(f.rankings, placeId);
    if (s !== null) {
      scores.push(s);
      names.push(f.name);
    }
  }
  if (scores.length === 0) return null;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  return { average: round1(mean), count: scores.length, names };
}

export function formatScore(x: number): string {
  return x.toFixed(1);
}
