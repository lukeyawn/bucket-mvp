import { useStore } from './store';
import { displayRank, sentimentOf } from './ranking';
import { scoreIn } from './scores';
import type { Place, Sentiment } from './types';

export interface MyRank {
  rank: number;
  of: number;
  score: number;
  sentiment: Sentiment;
}

/** The user's rank and score for a place, or null if it isn't ranked. */
export function useMyRank(place: Place | undefined): MyRank | null {
  const ranking = useStore((s) => (place ? s.rankings[place.tier] : undefined));
  if (!place || !ranking) return null;
  const r = displayRank(ranking, place.id);
  const score = scoreIn(ranking, place.id);
  const sentiment = sentimentOf(ranking, place.id);
  if (!r || score === null || !sentiment) return null;
  return { ...r, score, sentiment };
}

export function formatCollectedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
