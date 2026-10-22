import placesJson from '../data/places.json';
import listsJson from '../data/lists.json';
import friendsJson from '../data/friends.json';
import demoProfileJson from '../data/demoProfile.json';
import { friendsAverage, type FriendsAverage } from './scores';
import { TIERS, type Collection, type Friend, type Place, type PlaceList, type TierRanking } from './types';

export const places = placesJson as Place[];
export const lists = listsJson as PlaceList[];
export const friends = friendsJson as Friend[];
export const demoProfile = demoProfileJson as { collections: Collection[]; rankings: TierRanking[] };

export const placesById: Record<string, Place> = Object.fromEntries(places.map((p) => [p.id, p]));

export function getPlace(id: string | undefined): Place | undefined {
  return id ? placesById[id] : undefined;
}

export function getList(id: string | undefined | null): PlaceList | undefined {
  return id ? lists.find((l) => l.id === id) : undefined;
}

export function listsContaining(placeId: string): PlaceList[] {
  return lists.filter((l) => l.placeIds.includes(placeId));
}

// Friends' rankings are static, so compute every place's average once.
const averages: Record<string, FriendsAverage | null> = Object.fromEntries(
  places.map((p) => [p.id, friendsAverage(friends, p.id)]),
);

export function friendsAverageFor(placeId: string): FriendsAverage | null {
  return averages[placeId] ?? null;
}

export interface FriendsRank {
  rank: number; // 1 = friends' highest average in the tier; ties share a rank
  of: number;   // places in the tier that at least one friend has ranked
}

const friendsRanks: Record<string, FriendsRank> = {};
for (const tier of TIERS) {
  const scored = places.filter((p) => p.tier === tier && averages[p.id]);
  for (const p of scored) {
    const avg = averages[p.id]!.average;
    friendsRanks[p.id] = { rank: 1 + scored.filter((q) => averages[q.id]!.average > avg).length, of: scored.length };
  }
}

/** Where a place sits among its tier by friends' average score, or null if no friend has ranked it. */
export function friendsRankFor(placeId: string): FriendsRank | null {
  return friendsRanks[placeId] ?? null;
}
