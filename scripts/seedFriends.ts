// Generates src/data/friends.json with a fixed random seed (section 6).
// Run with: npm run seed:friends
//
// Each place has a hidden quality value (0–10). Each friend's sentiment and order follow that value
// plus some noise, so friends' averages spread out instead of all landing near 5.

import { readFileSync, writeFileSync } from 'node:fs';
import type { Friend, Place, Sentiment, Tier, TierRanking } from '../src/lib/types.ts';

const QUALITY: Record<string, number> = {
  'mount-bonnell': 8.8,
  'capital-factory': 5.2,
  'hi-how-are-you-mural': 7.4,
  'barton-springs-pool': 9.5,
  'hartman-prehistoric-garden': 6.3,
  'zilker-hillside-theater': 7.0,
  'lou-neff-point': 6.0,
  'austin-nature-science-center': 5.6,
  'zilker-moonlight-tower': 4.6,
  'deep-eddy-pool': 8.2,
  'sculpture-falls': 7.8,
  'twin-falls': 4.0,
  'bull-creek-district-park': 8.0,
  'greetings-from-austin-mural': 3.6,
  'treaty-oak': 6.8,
  'congress-bridge-bats': 9.0,
  'pennybacker-bridge-overlook': 8.6,
  'umlauf-sculpture-garden': 6.4,
  'texas-state-capitol': 8.3,
  'mckinney-falls': 7.6,
  'enchanted-rock': 9.3,
  'old-faithful': 8.4,
  'grand-canyon-mather-point': 9.6,
  'statue-of-liberty': 7.2,
  'yosemite-tunnel-view': 9.7,
};

// How likely each friend is to have collected a place, by tier.
const FRIENDS: { id: string; name: string; reach: Record<Tier, number> }[] = [
  { id: 'maya', name: 'Maya', reach: { local: 0.75, state: 0.7, legendary: 0.5 } },
  { id: 'jordan', name: 'Jordan', reach: { local: 0.55, state: 0.7, legendary: 0.25 } },
  { id: 'priya', name: 'Priya', reach: { local: 0.6, state: 0.35, legendary: 0.5 } },
  { id: 'sam', name: 'Sam', reach: { local: 0.4, state: 0.7, legendary: 0.25 } },
  { id: 'diego', name: 'Diego', reach: { local: 0.5, state: 0.35, legendary: 0.25 } },
];

// Places no friend has collected, so the map also shows pins without a score.
const UNVISITED = new Set(['austin-nature-science-center', 'umlauf-sculpture-garden']);

// mulberry32: small, deterministic PRNG.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261014);
const gaussian = () => {
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const places: Place[] = JSON.parse(readFileSync(new URL('../src/data/places.json', import.meta.url), 'utf8'));
for (const p of places) {
  if (QUALITY[p.id] === undefined) throw new Error(`No quality value for ${p.id}`);
}

const sentimentFor = (perceived: number): Sentiment => (perceived >= 7 ? 'loved' : perceived >= 4 ? 'okay' : 'disliked');

const friends: Friend[] = FRIENDS.map(({ id, name, reach }) => {
  const tiers: Tier[] = ['local', 'state', 'legendary'];
  const rankings: TierRanking[] = tiers.map((tier) => {
    const perceived = places
      .filter((p) => p.tier === tier && !UNVISITED.has(p.id))
      .filter(() => rand() < reach[tier])
      .map((p) => ({ id: p.id, value: QUALITY[p.id] + gaussian() * 1.2 }))
      .sort((a, b) => b.value - a.value);
    const groups: Record<Sentiment, string[]> = { loved: [], okay: [], disliked: [] };
    for (const { id: placeId, value } of perceived) groups[sentimentFor(value)].push(placeId);
    return { tier, groups };
  });
  return { id, name, rankings };
});

const out = new URL('../src/data/friends.json', import.meta.url);
writeFileSync(out, JSON.stringify(friends, null, 2) + '\n');

const counts = places.map((p) => [p.id, friends.filter((f) => f.rankings.some((r) => Object.values(r.groups).flat().includes(p.id))).length]);
console.log(`Wrote ${friends.length} friends to src/data/friends.json`);
for (const [id, n] of counts) console.log(`  ${String(n).padStart(2)}  ${id}`);
