# Bucket: Design Doc

**Status:** Draft, October 14, 2026
**Owner:** Luke
**Scope:** Demo 4 web prototype (due Friday, October 16) and the Cycle 5 roadmap (through Demo Day, November 13)

---

## 1. Overview

Bucket is a collecting game for real places. You collect a place by going there and taking a photo on location, rank it head-to-head against other places you've collected, and see how your friends ranked it. Curated lists of places fill up like buckets as you collect them.

**Target user:** young adults in Austin, both recent arrivals and people who have lived here a while, who want to explore beyond the city's well-known spots.

**Problem:** Austin's hidden gems are scattered across Instagram and TikTok posts that only surface by luck, mixed in with sponsored content. There's no single place to find them, keep track of them, or tell which ones are worth the trip.

**Insight:** Pokémon Go proved that collecting gets people out the door, but its landmarks were never the point. Beli proved that head-to-head rankings from friends are more trustworthy than strangers' star ratings, but only for restaurants. Bucket makes the places themselves the collectible, and uses friends' rankings to say which ones are worth it.

### Measurable goals (Demo 4 acceptance criteria)

These come from the Pitch 4 submission. Goals 1 and 3 have been refined since the pitch; see the iteration log in section 15.

| # | Goal | How it's verified |
|---|---|---|
| 1 | A user can collect a place only when their device location is within that place's collection radius (default 100 m, plus an allowance of half the reported accuracy, which must be 75 m or better) and they have taken a photo. | Unit tests on the distance gate, plus one real collect at Capital Factory in the laptop browser. |
| 2 | Ranking a new place into a tier group with up to 15 ranked places takes no more than 4 comparisons after the initial loved / okay / didn't-like choice. | Unit test that inserts into every position of groups sized 0 to 15 and counts comparisons. |
| 3 | Each place page displays the user's own rank and the average score among friends who have collected it. | Unit tests on score math, plus a manual check on a place with seeded friend data. |

---

## 2. Scope

### Demo 4 (build by Friday, October 16)

- Runs locally in a laptop browser on `localhost`, laid out as a phone-width app. No hosting.
- Map of hand-seeded places with your location shown, filterable by tier (one at a time) and by collected / not collected. Every pin a friend has collected shows friends' average score.
- Collect flow: location check against the place's radius, then a photo from the webcam
- Simulated-location mode for demoing places you can't physically visit, with a visible banner. Library photos are allowed in this mode.
- Ranking flow: loved / okay / didn't like, then binary-insertion comparisons within that tier
- Rankings screen: your full order for each tier, with scores
- Place page: your rank, friends' average score, which lists the place belongs to
- Buckets screen: 2–3 curated Austin lists, each shown as a bucket that fills as you collect
- Profile: "Luke" with an initial avatar, collection counts by tier, collected places, settings (simulated location, load demo profile, reset data)
- Seeded demo profile: about 12 places already collected and ranked, so a live collect goes through real comparisons
- Simulated friends with seeded rankings, clearly labeled as demo data

### Out of scope for Demo 4

- Native iOS (Cycle 5)
- Hosting and phone browsers (kept only as a fallback for the real collect; see section 8)
- Splash physics (stretch goal; the Demo 4 bucket uses a simple animated fill)
- Shaped Legendary trophies, metal finishes, the profile trophy shelf (Cycle 5)
- Ranking destinations such as Yellowstone vs. Arches (Cycle 5)
- Real accounts, friend requests, cloud sync, any backend
- User-submitted places or user-created lists
- Global or public ratings (never; this is a product principle, not a scope cut)
- Trip planning and itineraries
- Re-ranking or deleting a ranked place
- Collecting a place more than once
- Collecting with a library photo's embedded location (deferred; see section 17)

---

## 3. Curation rules

These rules decide what goes into the seed data and which tier it gets. Write new places against them so tiers stay consistent.

### What counts as a collectible place

**A collectible place is somewhere specific you can stand and take a photo.** Barton Springs Pool is a place. Zilker Park, at 350 acres, is not; it becomes a list of spots inside it. Small parks that are effectively one spot (a pocket park, a single overlook) can stay a single place.

**It must be legal and reasonably safe to visit.** Only include places with public access: no private land, no closed swimming holes, no caves or ledges that require climbing past signs. Check current access before adding a place, since a collecting game sends people there.

Each place has its own **collection radius**. Use 100 m by default, smaller for a mural or statue, larger for a big pool or a viewpoint area. The minimum is 40 m, because location readings are rarely more precise than that; the collect check adds an allowance for location error on top of the radius (section 8).

### Tiers

Tiers mostly describe **how famous a place is**. State designations are a useful shortcut for State Treasure, since fame alone makes Local and State hard to tell apart. National designations are not a shortcut for Legendary; only the tests below decide that.

| Tier | Definition | Examples |
|---|---|---|
| **Local** | Known mainly to people who are there. | Mount Bonnell, a mural, a swimming hole, the cave on Mount Bonnell |
| **State Treasure** | Has a state designation (state parks and natural areas, the capitol, the state fair) or is instantly recognizable as part of that state. | Texas State Capitol, Enchanted Rock, Palo Duro Canyon |
| **Legendary** | Recognizable across the country or the world; a place people plan a trip around. | Old Faithful, the Grand Canyon, the Statue of Liberty |

Rules for Legendary:
- **The trip test:** would people travel across the country mainly to see it? If not, it isn't Legendary. Something with a "National" designation (for example, a national historic site of a minor figure) can still be State or Local, or left out.
- **Symbol test for borderline cases:** is it famous mainly as a symbol of its state, or of the country? State symbol → State Treasure. Country symbol → Legendary.
- **Hard cap:** at most 50 Legendary places nationwide. To add one, it must beat the weakest one already on the list.

Scope for now is the United States only.

### Lists

Lists are containers. A place can belong to several lists, and a list can mix tiers.

- **Themed lists** are a collection of things: "Austin Swimming Holes," "Austin Views."
- **Destination lists** are a real place with boundaries: "Zilker Park," "Yellowstone." Destinations become rankable against each other in Cycle 5.

Keep curated lists to about 5–15 places so each collect visibly fills the bucket.

---

## 4. Core user flow

1. **Browse:** open the app to a map of nearby places, with your location shown. Pins your friends have collected show their average score. Filter by tier or by collected status.
2. **Choose:** tap a pin to see the place, your rank if you've collected it, and your friends' average score.
3. **Collect:** at the place, tap Collect. The app checks your location, then you take a photo.
4. **Fill:** the place drops into its buckets. One bucket plays the fill animation (see "Which bucket animates" in section 5); others show as small chips ("+1 Austin Views · 4/8").
5. **Rank:** choose loved it / okay / didn't like it, then answer a few "which was better?" comparisons. You see your result ("#3 of 12 Local").
6. **Repeat:** friends' scores on uncollected pins suggest where to go next.

**First-time experience (cold start):** on first launch, a one-line explanation appears before the browser asks for location access. A new user has no collection and no real friends. The map is fully seeded, every bucket is visible at 0%, and empty screens say what to do next ("Collect your first place to start filling a bucket"). Simulated friends give every place page some friend data in the demo. For the demo itself, Settings can load a seeded demo profile instead (section 6).

---

## 5. Screens (Demo 4)

Bottom navigation with four tabs: **Map**, **Buckets**, **Rankings**, **Profile**. The app is a phone-width column (about 390–430 px) centered on a neutral backdrop in the laptop browser. All primary actions sit in the bottom half of the screen for one-handed use.

### Map (home)
- Full-screen map centered on Austin, with a "you are here" dot and a control to zoom out to the whole US (for Legendary places).
- **First launch:** a one-line explanation ("Bucket uses your location to show what's nearby and to check that you're actually there when you collect"), then the browser's location prompt. If the user declines, the map still works; Collect explains how to allow location.
- Pins differ by tier in **shape and color** (never color alone) and by collected status (filled vs. outlined). See section 12.
- **Friends' scores on pins:** every pin that at least one friend has collected shows a small score label beneath it ("8.4"). Pins no friend has collected show no label.
- Filter chips along the top: tier (All / Local / State / Legendary, one at a time) and status (All / Collected / Not yet).
- Tapping a pin opens a **bottom sheet**: name, tier, short description, your rank or "Not collected yet", friends' average, and a Collect button if not collected. Swiping the sheet up opens the full place page.

### Place page
- Your photo if collected; otherwise a neutral placeholder (no stock photos). Demo-profile collections show an illustrated tile in the tier color, labeled "Demo." Simulated collections are tagged "Simulated."
- Name, tier badge, description, area.
- **Your rank:** "#3 of 12 · Local" with your score, or "Not collected yet." If the place is collected but not yet ranked (the ranking flow was left early), a **Rank it** button.
- **Friends:** average score with a count ("8.4 from 3 friends") and their names, labeled "Demo friends." Names are plain text. If none have collected it: "None of your friends have been here yet."
- Lists this place belongs to, with each list's progress.
- Collect button if not collected. Once collected, it's replaced by "Collected Oct 15"; a place can't be collected again.

### Collect flow
1. **Locating:** spinner while getting a fresh position. (Location permission was already requested at launch.)
2. **Too far:** "You're 2.3 km from Mount Bonnell. Get within 100 m to collect." with a retry button.
3. **Weak signal:** if reported accuracy is worse than 75 m, "Your location is only accurate to 120 m; collecting needs 75 m or better. Move near a window, make sure Wi-Fi is on, and try again." (Waiting alone rarely helps on a laptop, since its location comes from Wi-Fi.)
4. **Approximate only:** if accuracy is worse than 1 km, "Your location is only approximate. Turn on Wi-Fi and location services, then try again."
5. **Blocked or failed:** "Location is blocked for this site. Allow it in your browser's site settings to collect." or, on timeout, "Couldn't get your location. Try again."
6. **In range:** the in-app camera opens (live webcam preview with a shutter button). In simulated mode, a "Choose from library" option also appears.
7. **Saved:** fill animation for one bucket, chips for other affected buckets, then straight into the ranking flow.

**Which bucket animates:** when a collect affects several buckets, one plays the full animation and the rest show as chips. Priority: a list that just completed, then the list the user opened this place from, then the list closest to complete.

### Ranking flow
1. **Sentiment:** three large buttons: Loved it / It was okay / Didn't like it.
2. **Comparisons:** two large side-by-side cards (photo, name). Tap the better one. A "Too tough to call" option sits below. A progress line shows "Comparison 2 of about 4." An undo control reverts the last answer; undo on the first comparison returns to the sentiment choice.
3. **Result:** "#3 of 12 · Local" with the score, and a Done button.

If the user leaves partway through, the place stays collected but unranked. Ranking restarts from the sentiment step via **Rank it** on the place page or the Rankings screen.

### Rankings
- Tier switcher at the top: Local / State / Legendary, one at a time.
- The tier's full order in three sections (Loved, Okay, Didn't like). Each row shows position, photo thumbnail, name, and score. Tapping a row opens the place page.
- Collected but unranked places sit at the top with a **Rank it** button.
- Empty state: "Collect a place to start your rankings."

### Buckets
- A grid of curated lists, each shown as a bucket with its water level and "4/8."
- Tapping a bucket opens the list: its places in order, collected ones marked, uncollected ones tappable to open their place page.
- A completed bucket gets a distinct full state (for Demo 4, a gentle shimmer on the water and a "Complete" label).

### Profile
- "Luke" with an initial avatar (hardcoded; there are no accounts).
- Counts by tier ("Local 6 · State 2 · Legendary 1").
- Grid of collected places with your photos.
- Settings: **Simulate location** toggle, **Load demo profile** (replaces current data, with confirmation), **Reset all data** (with confirmation).

---

## 6. Data model

TypeScript types for the web prototype. Seed data lives in JSON files under `src/data/`; user data lives in the browser (section 9).

```ts
type Tier = 'local' | 'state' | 'legendary';
type Sentiment = 'loved' | 'okay' | 'disliked';
type CollectionSource = 'live' | 'simulated' | 'demo';

interface Place {
  id: string;            // stable slug, e.g. "mount-bonnell"
  name: string;
  description: string;   // one or two sentences
  area: string;          // shown on the place page, e.g. "Downtown", "Zilker Park"
  lat: number;
  lng: number;
  radiusM: number;       // collection radius; default 100, minimum 40
  tier: Tier;
  city: string;          // "Austin"
  state: string;         // "TX"
}

interface PlaceList {
  id: string;
  name: string;
  description: string;
  kind: 'themed' | 'destination';
  placeIds: string[];    // a place can appear in many lists
}

interface Collection {
  placeId: string;
  collectedAt: string;   // ISO timestamp
  photoKey: string | null; // key of the photo blob in IndexedDB; null for demo-profile collections
  lat: number;           // where the device was when collected; the place's own
  lng: number;           //   coordinates for simulated and demo collections
  accuracyM: number;     // 0 for simulated and demo collections
  source: CollectionSource; // live, simulated-location mode, or seeded demo profile
}

// One ranking per tier. Each group is an ordered list of placeIds, best first.
// A collected place that isn't in any group is "unranked".
interface TierRanking {
  tier: Tier;
  groups: Record<Sentiment, string[]>;
}

interface Friend {
  id: string;
  name: string;
  rankings: TierRanking[];   // seeded; only places this friend "collected"
}

interface Settings {
  simulateLocation: boolean;
  seenLocationIntro: boolean;
}
```

**Seeded friends:** generate 4–5 friends with a small seed script using a fixed random seed, so their rankings stay consistent across reloads and cover most seeded places. Each friend should have collected a different subset, so friend counts vary from place to place.

Don't give friends independent random rankings: averages of 3–4 random scores all land near 5, so every pin would read 4–6 and the map would recommend nothing. Instead, give each seeded place a hidden quality value (hand-set, 0–10) in the script, and have each friend's sentiment and order follow that value plus some noise. Averages then spread out, and well-loved places look well loved.

**Demo profile:** `src/data/demoProfile.json` holds about 12 collections (`source: 'demo'`) and their rankings: 7 places in Loved Local, so ranking a new loved Local place takes exactly 3 comparisons; 2–3 each in Okay and Didn't like; and one State Treasure. It excludes Capital Factory, the backup live-collect place (section 11), and any other place planned for a live collect. Loading it replaces the current collections, rankings, and photos.

---

## 7. Ranking and scores

### Binary insertion (goal 2)

Rankings are per tier. A tier's full order is the `loved` group, then `okay`, then `disliked`. A new place is only ever compared against places in the **same tier and same sentiment group**.

```
insert(newPlace, group):
  lo = 0, hi = group.length
  while lo < hi:
    mid = floor((lo + hi) / 2)
    answer = ask("Which was better?", newPlace, group[mid])
    if answer == newPlace:   hi = mid
    elif answer == group[mid]: lo = mid + 1
    elif answer == "too tough":
      lo = mid; break        // place it right at mid and stop
  group.insert(lo, newPlace)
```

- **Comparison count:** at most ceil(log2(n + 1)) for a group of n places. For n ≤ 15, that's at most 4, which satisfies goal 2.
- **Empty group:** no comparisons; the place is inserted directly.
- **Undo:** keep the stack of (lo, hi) states so the last answer can be reverted. Undoing with an empty stack returns to the sentiment choice.
- **Progress label:** "Comparison k of about ceil(log2(n + 1))."

### Display rank

Your rank is the place's position in the tier's full order (loved, then okay, then disliked), shown as "#3 of 12 · Local."

### Scores (goal 3)

Rank positions can't be averaged across friends, because "#2 of 5" and "#2 of 30" mean different things. Each ranked place therefore also gets a score from 0 to 10, set by its sentiment band and its position within that band:

| Group | Band |
|---|---|
| Loved | 6.7 – 10.0 |
| Okay | 3.4 – 6.6 |
| Didn't like | 0.0 – 3.3 |

For a group of size m, the place at index i (0 = best) scores:

```
score = hi - (hi - lo) * i / max(m - 1, 1)     // rounded to 1 decimal
```

A group of one scores the top of its band.

Known limits: a score still depends somewhat on group size (the worst of 2 loved places and the worst of 30 both score 6.7), and inserting a place shifts the scores of everything below it in that group. That's acceptable for averaging across friends, but don't present scores as precise.

**Friends' average** for a place is the mean score across friends who have ranked it, shown with the count ("8.4 from 3 friends").

---

## 8. Location verification (goal 1)

- Ask for location permission at launch, after the one-line explanation. Read the position once at launch for the map's "you are here" dot, and again when the user taps Collect, using `navigator.geolocation.getCurrentPosition` with `enableHighAccuracy: true`, a 15-second timeout, and `maximumAge: 0`. There is no background tracking.
- Compute distance with the haversine formula.
- **The collect check**, in this order:

```
collectCheck(place, pos):
  d = haversine(pos, place)
  if d - pos.accuracy > place.radiusM: return tooFar(d)   // too far even in the best case
  if pos.accuracy > 1000:              return approximate
  if pos.accuracy > 75:                return weakSignal
  if d <= place.radiusM + pos.accuracy / 2: return ok
  return tooFar(d)
```

- Collect is only ever allowed when distance ≤ `place.radiusM` + half the reported accuracy **and** reported accuracy ≤ 75 m.
- **Why the allowance:** a reading can be off by up to its accuracy in any direction. Requiring the raw reading inside a 40 m radius would often reject someone standing right at the spot when accuracy is 40–75 m. Allowing the full accuracy would let a 40 m mural be collected from 115 m away. Half the accuracy is the compromise.
- Store the device position, accuracy, and `source` on the collection, so simulated and demo collections can always be told apart from live ones.

### Running on a laptop

In a laptop browser, location comes from nearby Wi-Fi networks rather than GPS, usually accurate to 20–100 m in a dense area like downtown. On Windows, Chrome only gets a location when Windows location services are on.

**Check accuracy at Capital Factory on Thursday.** This is required, not optional: the real collect and the video are both on Friday afternoon, so there's no time to recover from a surprise then. Open the app there, tap Collect a few times, and note the reported accuracy.

**If accuracy there is often worse than 75 m, use the phone fallback** rather than faking the collect or loosening the threshold a lot:
1. Deploy the build to Vercel or Netlify. Both serve HTTPS automatically, so the phone browser allows camera and location.
2. Do the real collect at Capital Factory on the phone, using GPS, and screen-record it for the demo video.
3. Disclose that this one step was shown on a phone.

The webcam capture screen uses `getUserMedia`, which also works in phone browsers, so no extra code is needed.

### Simulated-location mode

You can't stand at a dozen places for a demo recording, so the prototype has a simulated-location mode:
- Toggled in Profile → Settings.
- While on, a **persistent banner** across the top of every screen reads "Simulated location" in a contrasting color. The demo guide requires disclosing mocked behavior, and the banner makes that visible on screen.
- In this mode, the location check uses a position at the place's own coordinates with accuracy 0 (as if you were standing there with perfect signal) and records `source: 'simulated'`.
- The photo can come from the camera or the photo library.

**For the demo,** collect Capital Factory for real, with simulation off, to show goal 1 working end to end.

---

## 9. Photos and storage

- **Capture:** desktop browsers ignore the `capture` attribute on file inputs, so the app has its own camera screen: `getUserMedia({ video: true })` shows a live webcam preview, and the shutter button grabs the current frame to a canvas. In simulated mode, an `<input type="file" accept="image/*">` also lets you pick from the library. Any location embedded in a library photo is ignored for now.
- **Shrink before saving:** draw to a canvas, resize so the long edge is 1280 px, and export as JPEG at 0.8 quality.
- **Photos** are stored as blobs in IndexedDB (via the `idb-keyval` package). Basic browser storage (localStorage) is too small for photos.
- **Everything else** (collections, rankings, settings) is small JSON in localStorage, via a Zustand store with its `persist` middleware.
- On first launch, call `navigator.storage.persist()` so the browser doesn't evict data when storage runs low.
- **Reset all data** clears both stores. **Load demo profile** clears both, then writes the demo data.
- **Privacy:** photos and locations never leave the device in Demo 4. There is no server.

---

## 10. Tech stack and architecture

| Concern | Choice | Why |
|---|---|---|
| Framework | React + Vite + TypeScript | Fast to build with Claude Code; TypeScript catches data-shape mistakes. |
| Routing | React Router | Map, Place, Buckets, List, Rankings, Profile routes. |
| State | Zustand with `persist` | Small, simple, persists to localStorage. |
| Map | MapLibre GL JS with OpenFreeMap tiles | Free, no API key, and the map style can be recolored and stripped of other businesses so Bucket's pins stand out. Start with OpenFreeMap's muted "positron" style. Check OpenFreeMap's current terms and style URLs. Needs internet for tiles; everything else runs locally. |
| Camera | `getUserMedia` | Webcam preview and capture in the laptop browser. |
| Photos | `idb-keyval` (IndexedDB) | Simple key/value storage for image blobs. |
| Icons | Lucide | Consistent line icons; no emoji as icons. |
| Fonts | Bricolage Grotesque (headings) via `@fontsource`, system UI font for body | Distinctive and friendly; bundled so it doesn't depend on Google Fonts at demo time. |
| Tests | Vitest | Unit tests for ranking, scores, and the distance gate. |
| Running | Local only: `npm run dev` | Browsers treat `localhost` as a secure page, so camera and location work without HTTPS. |

**Running during development and the demo:** run `npm run dev` and open `http://localhost:5173` in Chrome on the laptop. When the dev server runs inside WSL, Windows Chrome can still reach it at `localhost`. During development, use Chrome's device toolbar at about 390 px wide to check the phone layout.

### Project structure

```
src/
  data/
    places.json
    lists.json
    friends.json          # generated by scripts/seedFriends.ts
    demoProfile.json      # seeded collections and rankings for the demo
  lib/
    ranking.ts            # binary insertion, comparison stepping, undo
    scores.ts             # score bands, friends' average
    geo.ts                # haversine, collect check
    photos.ts             # resize + IndexedDB
    store.ts              # Zustand store (collections, rankings, settings, demo profile)
  components/
    MapView.tsx
    PlacePin.tsx
    PlaceSheet.tsx
    BucketFill.tsx
    CameraCapture.tsx
    ComparisonCards.tsx
    SimulatedBanner.tsx
  screens/
    MapScreen.tsx
    PlaceScreen.tsx
    CollectFlow.tsx
    RankFlow.tsx
    RankingsScreen.tsx
    BucketsScreen.tsx
    ListScreen.tsx
    ProfileScreen.tsx
scripts/
  seedFriends.ts
tests/
  ranking.test.ts
  scores.test.ts
  geo.test.ts
```

---

## 11. Seed data

**Target for Demo 4:** about 20 places. Each one needs coordinates checked against a map source, which takes longer than it sounds. Grow toward 30–50 after Demo 4.
- Mostly **Austin Local** places, including real hidden gems, such as the cave on Mount Bonnell (confirm it's publicly accessible).
- **Capital Factory** as a Local place, in at least one list, so the live collect fills a bucket on screen. It doesn't really meet the curation rules (it's a coworking hub, not a hidden gem); it's included only for the demo.
- **One backup live-collect place** that you can easily reach (for example, near campus or home), in at least one list, in case the Capital Factory collect falls through.
- A handful of **State Treasures** (for example, the Texas State Capitol, Enchanted Rock).
- **3–4 Legendary** places across the US, each using one classic spot (for example, Old Faithful itself, a named Grand Canyon viewpoint).
- **2–3 curated Austin lists** of 5–15 places each, at least one of them a destination list (for example, "Zilker Park").

**Coordinates:** take them from a map source (OpenStreetMap, Wikipedia, or a right-click in Google Maps), never from memory or a guess; a wrong pin breaks the location check. Verify Capital Factory's pin on site, since it's the one real collect.

Example entry format (coordinates intentionally left as placeholders):c

```json
{
  "id": "mount-bonnell",
  "name": "Mount Bonnell",
  "description": "Limestone overlook above Lake Austin with one of the best views in the city.",
  "area": "West Austin",
  "lat": 0,
  "lng": 0,
  "radiusM": 100,
  "tier": "local",
  "city": "Austin",
  "state": "TX"
}
```

---

## 12. Visual style

AI tends to fall back on a generic look. These decisions exist so the build follows a specific direction instead. The values below are a **starting point to adjust**, not final.

### Direction

**Bucket theming throughout.** Clean, bright, and outdoorsy, with water as the signature element. Progress is always shown as water filling a plain bucket. The pristine glass and metal treatment is reserved for trophies in Cycle 5, so it stays special.

### Tokens

| Token | Value | Use |
|---|---|---|
| `bg` | `#F6F4EF` | App background (warm off-white) |
| `surface` | `#FFFFFF` | Cards, sheets |
| `ink` | `#1D2731` | Primary text |
| `ink-muted` | `#5E6B76` | Secondary text |
| `water` | `#2E86DE` | Bucket water, links |
| `water-deep` | `#1F5FA8` | Water depth gradient, primary buttons with white text (about 6.4:1; white on `water` is only about 3.8:1, below the 4.5:1 AA minimum) |
| `water-pressed` | `#184C87` | Pressed primary buttons |
| `tier-local` | `#2E86DE` | Local pins (circle) |
| `tier-state` | `#A87A1F` | State Treasure pins (shield). Darkened from `#C8962E`, which was only about 2.7:1 on white, below the 3:1 minimum for UI graphics. |
| `tier-legendary` | `ink` star; collected adds a pale pastel ring (`#F4D9F5` → `#D9F0F7` → `#F7F0D2`) | Legendary pins (star) |
| `sim-banner` | `#F2B705` background, `#1D2731` text | Simulated-location banner |
| Radius | 14 px cards, fully rounded chips | |
| Spacing | 4 px scale (4, 8, 12, 16, 24, 32) | |
| Tap targets | at least 44 × 44 px | |
| Fonts | Bricolage Grotesque for headings, system UI font for body text | |

### Pins
- Shape encodes tier: **circle** = Local, **shield** = State Treasure, **star** = Legendary.
- **Collected** = filled with the tier color (an `ink`-filled star with the pastel ring for Legendary). **Not collected** = white fill with a colored outline (an `ink` outline for Legendary). A pale ring alone would be too subtle on the light map to tell collected Legendary places apart.
- **Score label:** a small pill beneath the pin (`surface` background, `ink` text, about 12 px) showing friends' average. No pill when no friend has collected the place.
- Clustering at low zoom is a stretch goal; 20–50 pins spread across Austin should be readable without it.

### Bucket fill (Demo 4)
- An SVG bucket (tapered body with a handle). Water is a shape clipped to the bucket's interior, with a gently moving surface wave.
- When a collect raises the level, animate over about 900 ms with a slight overshoot and settle, so the water sloshes.
- **Stretch goal:** a drop falls in and causes a splash. The standard technique is a row of about 30 springs along the water surface, each pulled back to rest and spreading its motion to neighbors. Starting values to tune: tension 0.025, damping 0.025, spread 0.25.
- When the operating system's **reduce motion** setting is on (`prefers-reduced-motion`), skip the wave and splash and just show the new level.

### Avoid
- Emoji as icons
- Purple-to-blue gradients
- Glass or blur effects outside the Cycle 5 trophies
- Heavy drop shadows on every card

### Working with Claude Code on visuals
- Build and review **one screen at a time in a phone-width window**.
- Give specific feedback ("the Collect button is too high to reach"), not "make it look better."
- Reference other apps for **behavior**, not looks: a bottom sheet like Google Maps, two-card comparisons like Beli.

---

## 13. Testing

### Automated (Vitest)
- **Ranking:** for every group size from 0 to 15 and every possible final position, simulate the answers and assert the comparison count is ≤ 4 and the place lands in the right position. Test "too tough to call," undo, and undo back to the sentiment choice.
- **Scores:** band edges, a group of one, rounding, friends' average with 0, 1, and several friends.
- **Geo:** haversine against known distances. The collect check passes at exactly radius + accuracy / 2 and fails just beyond it; never passes when accuracy exceeds 75 m; reports too far rather than weak signal when distance − accuracy > radius; reports approximate when accuracy exceeds 1 km; simulated mode passes.

### Manual checklist (laptop Chrome)
- [ ] App loads at `localhost` with the phone-width layout
- [ ] Location explanation appears at launch before the browser prompt; the map shows your location
- [ ] Every pin with friend data shows a score label
- [ ] Real collect at Capital Factory succeeds with simulation off
- [ ] "Too far" message shows the correct distance
- [ ] Webcam opens; photo saves and shows on the place page after reload
- [ ] "Choose from library" appears only in simulated mode
- [ ] After loading the demo profile, a new loved Local place takes exactly 3 comparisons; undo works, including back to the sentiment choice
- [ ] Leaving mid-ranking leaves the place unranked, with Rank it on the place page and Rankings screen
- [ ] Rankings screen shows each tier's order with scores
- [ ] Place page shows your rank and friends' average
- [ ] Bucket level updates after a collect; completed bucket shows its full state
- [ ] Simulated-location banner is visible on every screen while the mode is on
- [ ] Reset all data clears collections, rankings, and photos

---

## 14. Build plan and demo prep

### Schedule (Demo 4 due Friday, October 16, 11:59 PM)

| When | Work |
|---|---|
| **Wed evening** | Scaffold the app (Vite, routing, store). Write seed data (about 20 places, including Capital Factory and the backup place). Map with tier-styled pins, the location dot, and the place bottom sheet. |
| **Thu** | Collect flow (location check, simulated mode, webcam capture, library picker, photo storage). Ranking flow and its tests. Score math and the friend seed script, then score labels and filters on the map. Place page and Rankings screen. **Go to Capital Factory and check the laptop's location accuracy** (required; see section 8). |
| **Fri morning** | Buckets and list screens with the fill animation. Profile, settings, and the demo profile. Run the manual checklist. |
| **Fri afternoon** | Fix what the checklist finds. Do the real collect at Capital Factory. Record the demo video. Write the Demo 4 submission. |

Splash physics is a stretch goal and isn't scheduled at all.

**If time runs short, cut in this order:** completed-bucket shimmer → the "which bucket animates" priority rule (animate the first affected list) → status filter → profile photo grid → empty-state copy → list screen details → "too tough to call." Never cut the location check, the ranking flow, or friends' averages; those are the three goals.

### Demo video (3–5 minutes)
- **Before recording:** load the demo profile.
- **Context (20–30 s):** the user and what this version set out to do.
- **Walkthrough (2–3 min):** browse the map with friends' scores on the pins → open a place → collect Capital Factory for real → rank it (3 comparisons) → watch a bucket fill → show the Rankings screen → collect a Legendary place with simulated location, with the banner visible.
- **Reflection (20–30 s):** what worked, what didn't, what changes next (native iOS, trophies).

### What to disclose as mocked or incomplete
- Friends are simulated, with seeded rankings.
- The demo profile's earlier collections are seeded (illustrated tiles, not real visits).
- Collections of places you can't visit are done in simulated-location mode (banner visible).
- The app runs locally in a laptop browser, laid out like a phone; it isn't hosted or running on a phone.
- All data, including photos, is stored only in the browser; there are no accounts or server.
- Places and lists are hand-curated; there is no user submission.
- Capital Factory is included as a Local place only so the live collect can happen during the demo.
- If the phone fallback was used (section 8), the real collect was shown on a phone.

Keep this list updated during the build; it becomes section C of the Demo 4 written submission.

---

## 15. Iteration log

Section E of the Demo submission asks for iterations in Before / Learning / Change / Result form. These are the design decisions made since Pitch 4. Add build-time iterations as they happen.

So far, every "Learning" here comes from design reasoning rather than from watching someone use the app. If anyone tries the prototype before the submission, even for five minutes, log what they did and said; one learning from a real user is worth more than several from reasoning.

**1. Collection radius**
- **Before:** a fixed 100 m radius for every place.
- **Learning:** places vary hugely in size. 100 m is too tight for a large pool and too loose for a mural.
- **Change:** each place has its own radius, defaulting to 100 m.
- **Result:** the location check matches the real size of each place.

**1b. Location error allowance**
- **Before:** collect only when the raw reading is inside the radius.
- **Learning:** readings are off by up to their reported accuracy (often 40–75 m), so someone standing at a small place like a mural would often be rejected.
- **Change:** allow half the reported accuracy on top of the radius, and still require accuracy of 75 m or better.
- **Result:** small places stay collectable without letting people collect from far away.

**2. Tiers**
- **Before:** Legendary / Landmark / Local, loosely based on notability.
- **Learning:** "notable" was hard to apply consistently, and official designations mislead (a "national" historic site isn't necessarily a must-see).
- **Change:** Local / State Treasure / Legendary, defined by how widely a place is famous, with a trip test and a 50-place cap for Legendary.
- **Result:** clear rules for curation, and Legendary stays rare.

**3. Parks**
- **Before:** a whole park could be a single place.
- **Learning:** a 350-acre park isn't useful as one pin for planning or for a location check.
- **Change:** a collectible is somewhere you can stand and take a photo; big parks become destination lists of spots.
- **Result:** pins point to specific places, and parks gain their own buckets.

**4. Progress**
- **Before:** tier progress counters ("12/40 Austin Landmarks").
- **Learning:** counters alone don't fit the Bucket name or feel rewarding.
- **Change:** curated lists of 5–15 places shown as buckets that fill with water.
- **Result:** every collect produces visible progress tied to the brand.

**5. Map**
- **Before:** Leaflet with standard OpenStreetMap tiles.
- **Learning:** standard tiles can't be recolored, and a realistic map shows every business, which competes with Bucket's pins.
- **Change:** MapLibre with a restylable vector map from OpenFreeMap.
- **Result:** a muted, on-brand map where Bucket's places stand out.

**6. Friends' average**
- **Before:** goal 3 said friends' "average rank."
- **Learning:** rank positions can't be averaged across friends with different list sizes.
- **Change:** each ranked place also gets a 0–10 score from its sentiment band and position; friends' average uses scores.
- **Result:** a number that can be averaged across friends (it still depends somewhat on group size; see section 7), and goal 3 is refined accordingly.

**7. Friends' scores on the map**
- **Before:** friends' average appeared only in a place's bottom sheet and page.
- **Learning:** deciding where to go next means comparing places at a glance, which opening one place at a time doesn't allow.
- **Change:** every pin a friend has collected shows friends' average score.
- **Result:** the map doubles as a set of recommendations.

**8. Demo profile**
- **Before:** the demo would start from an empty collection.
- **Learning:** the first place ranked in a group needs no comparisons, so goal 2 would never appear on screen.
- **Change:** a seeded demo profile with about 12 places already ranked.
- **Result:** the live collect goes through 3 comparisons on screen.

**9. Platform for the demo**
- **Before:** a mobile web app hosted on Netlify or Vercel and tested on a phone.
- **Learning:** the demo is shown from a laptop on a TV, and testing every change on a phone adds a deploy step to each iteration. (Hosting itself isn't the obstacle: Netlify and Vercel serve HTTPS automatically, which phone browsers require for camera and location.)
- **Change:** run locally in the laptop browser on `localhost`, laid out as a phone-width app, with a webcam capture screen. Keep a hosted build as the fallback for the real collect.
- **Result:** a faster build loop with location and camera still real. The tradeoff is laptop Wi-Fi positioning (20–100 m) instead of phone GPS, which is why the Capital Factory accuracy check matters (section 8).

---

## 16. Cycle 5 roadmap (October 23 – November 13)

Everything below is more than three weeks of work. Default priorities:
1. **Native iOS port** of the Demo 4 features. If the Mac hasn't arrived by October 23, keep building on the web prototype instead.
2. **Trophies and finishes**, the Demo Day showpiece. Start with the fallback (regular buckets on the shelf).
3. **Destination ranking**, if time allows.
4. **Real accounts, backend, and user submissions** come after Demo Day, unless customer discovery shows friends' rankings are the main draw.

Revisit this order after the customer discovery memo (October 30), before committing most of the cycle.

### Platform
- **Native iOS in SwiftUI** once the Mac arrives. Better shimmer and physics tools, free Apple Maps in native apps, and simulated locations in Xcode's simulator. The data model, ranking algorithm, seed data, and this doc carry over; the web interface code does not.
- App Store or TestFlight distribution needs the $99/year Apple Developer Program. It isn't needed for the simulator or Demo Day.

### Trophies and finishes
- **Every vessel starts as clear glass** so you can watch the water rise. On completion it transforms into its finish, with a shine sweeping across.
- **Finish by fame:** completed lists turn **silver**; each State Treasure is a one-item bucket that turns **gold**; each Legendary place is a one-item **shaped vessel** (a geyser for Old Faithful, a canyon for the Grand Canyon) that turns **iridescent platinum**.
- **Pristine, not tacky:** pale pastel iridescence on edges and highlights only; move the light, not the colors; no gold liquid.
- **Shaped vessels:** one water engine fills any outline. Each Legendary place stores a simple SVG outline. Legendary vessels fill in one splash, so no partial levels are needed. Avoid copying official logos.
- **Profile trophy shelf** on a dark "display case" background. Uncollected Legendary places show as faint empty outlines, which doubles as discovery.
- **Optional:** shimmer that shifts with phone tilt, like a holographic card (needs a motion-permission prompt on iPhone).
- **Fallback:** build the shelf with regular buckets first, then swap in shapes one at a time.

### When one collect affects several buckets
Demo 4's priority rule (section 5) carries over. In addition, a Legendary trophy always takes the main animation.

### Destination ranking
- Destination lists (Yellowstone, Arches, Zilker Park) become rankable against similar destinations.
- You can rank a destination only after collecting at least one spot in it.
- Ask once per destination, not after every collect.

### Social and data
- Real accounts and friends, with a backend.
- User-submitted places and user-created lists, with review for duplicates and unsafe spots.
- Later: promote places between tiers based on how many people collect them.

### Business and research (course deadlines)
- **Lean Canvas** due Friday, October 23.
- **Customer discovery memo** due Friday, October 30. Talk to real potential users: where their "places to try" list lives today, when they last went somewhere because a friend recommended it, and whether collecting would get them out the door.

---

## 17. Open questions

- **Name:** an existing social bucket-list app is already called "Bucket." Fine for class; revisit before any public launch.
- **"Local" label:** reads oddly for a lesser-known trail in Yellowstone. Keep it defined as "known mainly to people who are there," or rename (for example, "Gem").
- **Golden Gate Bridge** and similar borderline cases between State Treasure and Legendary: apply the trip test and symbol test, and record the decision.
- **Effort vs. prestige:** completing a 10-place list (silver) takes more effort than one visit to a State Treasure (gold). Acceptable if metals mean fame and list completion gets its own overflow celebration; revisit after user feedback.
- **Collecting with a library photo's location (deferred):** should a photo taken on an earlier visit, with an embedded location inside the radius, count as a genuine collect? If so, should it have an age limit? Note that iOS Safari often strips location from photos picked in a web page; native iOS can read it with permission.
- **Laptop location accuracy at Capital Factory:** unverified until the required Thursday check on site. If it's poor, use the phone fallback (section 8).
