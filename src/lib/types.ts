export type Tier = 'local' | 'state' | 'legendary';
export type Sentiment = 'loved' | 'okay' | 'disliked';
export type CollectionSource = 'live' | 'simulated' | 'demo';

export const TIERS: Tier[] = ['local', 'state', 'legendary'];
export const SENTIMENTS: Sentiment[] = ['loved', 'okay', 'disliked'];

export interface Place {
  id: string;            // stable slug, e.g. "mount-bonnell"
  name: string;
  description: string;   // one or two sentences
  why: string;           // one line on why it's worth going, for the feed card
  area: string;          // shown on the place page, e.g. "Downtown", "Zilker Park"
  lat: number;
  lng: number;
  radiusM: number;       // collection radius; default 100, minimum 40
  tier: Tier;
  city: string;
  state: string;
  photo?: SourcedPhoto;  // shown until you collect the place with your own photo
}

// A freely licensed photo from Wikimedia Commons, stored in public/places/.
export interface SourcedPhoto {
  src: string;
  author: string;
  license: string;       // e.g. "CC BY 3.0", "CC0", "Public domain"
  licenseUrl?: string;   // absent for public domain
  sourceUrl: string;     // the Commons file page
}

export interface PlaceList {
  id: string;
  name: string;
  description: string;
  kind: 'themed' | 'destination';
  placeIds: string[];    // a place can appear in many lists
}

export interface Collection {
  placeId: string;
  collectedAt: string;   // ISO timestamp
  photoKey: string | null; // key of the photo blob in IndexedDB; null for demo-profile collections
  lat: number;           // where the device was when collected; the place's own
  lng: number;           //   coordinates for simulated and demo collections
  accuracyM: number;     // 0 for simulated and demo collections
  source: CollectionSource;
}

// One ranking per tier. Each group is an ordered list of placeIds, best first.
// A collected place that isn't in any group is "unranked".
export interface TierRanking {
  tier: Tier;
  groups: Record<Sentiment, string[]>;
}

export interface Friend {
  id: string;
  name: string;
  rankings: TierRanking[];   // seeded; only places this friend "collected"
}

export interface Settings {
  simulateLocation: boolean;
  seenLocationIntro: boolean;
}

export const TIER_LABEL: Record<Tier, string> = {
  local: 'Local',
  state: 'State Treasure',
  legendary: 'Legendary',
};

// Short form for tight spots ("#3 of 12 · State").
export const TIER_SHORT: Record<Tier, string> = {
  local: 'Local',
  state: 'State',
  legendary: 'Legendary',
};

export const SENTIMENT_LABEL: Record<Sentiment, string> = {
  loved: 'Loved',
  okay: 'Okay',
  disliked: "Didn't like",
};
