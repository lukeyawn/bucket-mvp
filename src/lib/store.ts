import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { demoProfile } from './data';
import { clearPhotos } from './photos';
import { emptyRanking, withInserted } from './ranking';
import type { Collection, Sentiment, Settings, Tier, TierRanking } from './types';

interface BucketState {
  collections: Record<string, Collection>;
  rankings: Record<Tier, TierRanking>;
  wantToGo: Record<string, string>; // placeId -> ISO timestamp when saved; kept after collecting
  settings: Settings;

  addCollection: (c: Collection) => void;
  toggleWantToGo: (placeId: string) => void;
  rank: (placeId: string, tier: Tier, sentiment: Sentiment, index: number) => void;
  setSimulateLocation: (on: boolean) => void;
  markLocationIntroSeen: () => void;
  resetAll: () => Promise<void>;
  loadDemoProfile: () => Promise<void>;
}

const emptyRankings = (): Record<Tier, TierRanking> => ({
  local: emptyRanking('local'),
  state: emptyRanking('state'),
  legendary: emptyRanking('legendary'),
});

export const useStore = create<BucketState>()(
  persist(
    (set, get) => ({
      collections: {},
      rankings: emptyRankings(),
      wantToGo: {},
      settings: { simulateLocation: false, seenLocationIntro: false },

      addCollection: (c) => {
        // A place can't be collected twice.
        if (get().collections[c.placeId]) return;
        set((s) => ({ collections: { ...s.collections, [c.placeId]: c } }));
      },

      toggleWantToGo: (placeId) =>
        set((s) => {
          const { [placeId]: had, ...rest } = s.wantToGo;
          return { wantToGo: had ? rest : { ...s.wantToGo, [placeId]: new Date().toISOString() } };
        }),

      rank: (placeId, tier, sentiment, index) =>
        set((s) => ({
          rankings: { ...s.rankings, [tier]: withInserted(s.rankings[tier], sentiment, placeId, index) },
        })),

      setSimulateLocation: (on) => set((s) => ({ settings: { ...s.settings, simulateLocation: on } })),

      markLocationIntroSeen: () => set((s) => ({ settings: { ...s.settings, seenLocationIntro: true } })),

      resetAll: async () => {
        await clearPhotos();
        set({ collections: {}, rankings: emptyRankings(), wantToGo: {} });
      },

      loadDemoProfile: async () => {
        await clearPhotos();
        const rankings = emptyRankings();
        for (const r of demoProfile.rankings) rankings[r.tier] = structuredClone(r);
        set({
          collections: Object.fromEntries(demoProfile.collections.map((c) => [c.placeId, { ...c }])),
          rankings,
        });
      },
    }),
    {
      name: 'bucket-v1',
      partialize: (s) => ({ collections: s.collections, rankings: s.rankings, wantToGo: s.wantToGo, settings: s.settings }),
    },
  ),
);

/** Collected places that aren't in any group of their tier's ranking. */
export function isRanked(rankings: Record<Tier, TierRanking>, tier: Tier, placeId: string): boolean {
  const g = rankings[tier].groups;
  return g.loved.includes(placeId) || g.okay.includes(placeId) || g.disliked.includes(placeId);
}
