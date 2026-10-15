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
| 1 | A user can collect a place only when their device location is within that place's collection radius (default 100 m) and they have taken a photo. | Unit tests on the distance gate, plus one real collect on a phone at an actual place. |
| 2 | Ranking a new place into a tier group with up to 15 ranked places takes no more than 4 comparisons after the initial loved / okay / didn't-like choice. | Unit test that inserts into every position of groups sized 0 to 15 and counts comparisons. |
| 3 | Each place page displays the user's own rank and the average score among friends who have collected it. | Unit tests on score math, plus a manual check on a place with seeded friend data. |

---

## 2. Scope

### Demo 4 (build by Friday, October 16)

- Map of hand-seeded places, filterable by tier and by collected / not collected
- Collect flow: location check against the place's radius, then a photo
- Simulated-location mode for demoing places you can't physically visit, with a visible banner
- Ranking flow: loved / okay / didn't like, then binary-insertion comparisons within that tier
- Place page: your rank, friends' average score, which lists the place belongs to
- Buckets screen: 2–3 curated Austin lists, each shown as a bucket that fills as you collect
- Profile: collection counts by tier, collected places, settings (simulated location, reset data)
- Simulated friends with seeded rankings, clearly labeled as demo data

### Out of scope for Demo 4

- Native iOS (Cycle 5)
- Splash physics (stretch goal; the Demo 4 bucket uses a simple animated fill)
- Shaped Legendary trophies, metal finishes, the profile trophy shelf (Cycle 5)
- Ranking destinations such as Yellowstone vs. Arches (Cycle 5)
- Real accounts, friend requests, cloud sync, any backend
- User-submitted places or user-created lists
- Global or public ratings (never; this is a product principle, not a scope cut)
- Trip planning and itineraries
- Re-ranking or deleting a ranked place

---

## 3. Curation rules

These rules decide what goes into the seed data and which tier it gets. Write new places against them so tiers stay consistent.

### What counts as a collectible place

**A collectible place is somewhere specific you can stand and take a photo.** Barton Springs Pool is a place. Zilker Park, at 350 acres, is not; it becomes a list of spots inside it. Small parks that are effectively one spot (a pocket park, a single overlook) can stay a single place.

Each place has its own **collection radius**. Use 100 m by default, smaller for a mural or statue, larger for a big pool or a viewpoint area.

### Tiers

Tiers describe **how famous a place is**, not who manages it or where it is.

| Tier | Definition | Examples |
|---|---|---|
| **Local** | Known mainly to people who are there. | Mount Bonnell, a mural, a swimming hole, the cave on Mount Bonnell |
| **State Treasure** | Associated with the state (state parks, the capitol, the state fair) or instantly recognizable as part of that state. | Texas State Capitol, Enchanted Rock, the Golden Gate Bridge |
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

1. **Browse:** open the app to a map of nearby places. Filter by tier or by collected status.
2. **Choose:** tap a pin to see the place, your rank if you've collected it, and your friends' average score.
3. **Collect:** at the place, tap Collect. The app checks your location, then you take a photo.
4. **Fill:** the place drops into its buckets. The most relevant bucket plays the fill animation; others show as small chips ("+1 Austin Views · 4/8").
5. **Rank:** choose loved it / okay / didn't like it, then answer a few "which was better?" comparisons. You see your result ("#3 of 12 Local").
6. **Repeat:** friends' scores on uncollected places suggest where to go next.

**First-time experience (cold start):** a new user has no collection and no real friends. The map is fully seeded, every bucket is visible at 0%, and empty screens say what to do next ("Collect your first place to start filling a bucket"). Simulated friends give every place page some friend data in the demo.

---

## 5. Screens (Demo 4)

Bottom navigation with three tabs: **Map**, **Buckets**, **Profile**. All primary actions sit in the bottom half of the screen for one-handed use.

### Map (home)
- Full-screen map centered on Austin, with a control to zoom out to the whole US (for Legendary places).
- Pins differ by tier in **shape and color** (never color alone) and by collected status (filled vs. outlined). See section 12.
- Filter chips along the top: tier (All / Local / State / Legendary) and status (All / Collected / Not yet).
- Tapping a pin opens a **bottom sheet**: name, tier, short description, your rank or "Not collected yet", friends' average, and a Collect button if not collected. Swiping the sheet up opens the full place page.

### Place page
- Your photo if collected; otherwise a neutral placeholder (no stock photos).
- Name, tier badge, description, address or area.
- **Your rank:** "#3 of 12 · Local" with your score, or "Not collected yet."
- **Friends:** average score with a count ("8.4 from 3 friends") and their names, labeled "Demo friends." If none have collected it: "None of your friends have been here yet."
- Lists this place belongs to, with each list's progress.
- Collect button if not collected.

### Collect flow
1. **First time only:** a one-line explanation before the browser asks for location access ("We check that you're actually there before you collect").
2. **Locating:** spinner while getting the position.
3. **Too far:** "You're 2.3 km from Mount Bonnell. Get within 100 m to collect." with a retry button.
4. **Weak GPS:** if reported accuracy is worse than 75 m, "GPS signal is weak. Try again in a moment, ideally outdoors."
5. **In range:** prompt to take a photo (opens the phone camera).
6. **Saved:** fill animation for the most relevant bucket, chips for other affected buckets, then straight into the ranking flow.

### Ranking flow
1. **Sentiment:** three large buttons: Loved it / It was okay / Didn't like it.
2. **Comparisons:** two large side-by-side cards (photo, name). Tap the better one. A "Too tough to call" option sits below. A progress line shows "Comparison 2 of about 4." An undo control reverts the last answer.
3. **Result:** "#3 of 12 · Local" with the score, and a Done button.

### Buckets
- A grid of curated lists, each shown as a bucket with its water level and "4/8."
- Tapping a bucket opens the list: its places in order, collected ones marked, uncollected ones tappable to open their place page.
- A completed bucket gets a distinct full state (for Demo 4, a gentle shimmer on the water and a "Complete" label).

### Profile
- Counts by tier ("Local 6 · State 2 · Legendary 1").
- Grid of collected places with your photos.
- Settings: **Simulate location** toggle, **Reset all data** (with confirmation).

---

## 6. Data model

TypeScript types for the web prototype. Seed data lives in JSON files under `src/data/`; user data lives on the device (section 9).

```ts
type Tier = 'local' | 'state' | 'legendary';
type Sentiment = 'loved' | 'okay' | 'disliked';

interface Place {
  id: string;            // stable slug, e.g. "mount-bonnell"
  name: string;
  description: string;   // one or two sentences
  lat: number;
  lng: number;
  radiusM: number;       // collection radius; default 100
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
  photoKey: string;      // key of the photo blob in IndexedDB
  lat: number;           // where the device was when collected
  lng: number;
  accuracyM: number;
  simulated: boolean;    // true if collected in simulated-location mode
}

// One ranking per tier. Each group is an ordered list of placeIds, best first.
interface TierRanking {
  tier: Tier;
  groups: Record<Sentiment, string[]>;
}

interface Friend {
  id: string;
  name: string;
  rankings: TierRanking[];   // seeded; only places this friend "collected"
}
```

**Seeded friends:** generate 4–5 friends with a small seed script using a fixed random seed, so their rankings stay consistent across reloads and cover most seeded places. Each friend should have collected a different subset, so friend counts vary from place to place.

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

- **Comparison count:** at most ceil(log2(n + 1)) for a group of n places. For n ≤ 15, that's at most 4, which satisfies goal 2 because a group can never be larger than its tier.
- **Empty group:** no comparisons; the place is inserted directly.
- **Undo:** keep the stack of (lo, hi) states so the last answer can be reverted.
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

**Friends' average** for a place is the mean score across friends who have ranked it, shown with the count ("8.4 from 3 friends").

---

## 8. Location verification (goal 1)

- Use `navigator.geolocation.getCurrentPosition` with `enableHighAccuracy: true` and a 15-second timeout. Only request location when the user taps Collect; there is no background tracking.
- Compute distance with the haversine formula.
- **Collect is allowed when:** distance ≤ `place.radiusM` **and** reported accuracy ≤ 75 m.
- If accuracy is worse than 75 m, show the weak-GPS message instead of a distance.
- Store the device position, accuracy, and `simulated` flag on the collection, so collections made in simulated mode can always be told apart.

### Simulated-location mode

You can't stand at a dozen places for a demo recording, so the prototype has a simulated-location mode:
- Toggled in Profile → Settings.
- While on, a **persistent banner** across the top of every screen reads "Simulated location" in a contrasting color. The demo guide requires disclosing mocked behavior, and the banner makes that visible on screen.
- In this mode, the location check uses the place's own coordinates (as if you were standing there) and records `simulated: true`.

**For the demo,** collect at least one place for real, with simulation off, to show goal 1 working end to end.

---

## 9. Photos and storage

- **Capture:** `<input type="file" accept="image/*" capture="environment">`. This opens the rear camera on iOS Safari and Android Chrome with no extra library.
- **Shrink before saving:** draw to a canvas, resize so the long edge is 1280 px, and export as JPEG at 0.8 quality.
- **Photos** are stored as blobs in IndexedDB (via the `idb-keyval` package). Basic browser storage (localStorage) is too small for photos.
- **Everything else** (collections, rankings, settings) is small JSON in localStorage, via a Zustand store with its `persist` middleware.
- **Reset all data** clears both stores.
- **Privacy:** photos and locations never leave the device in Demo 4. There is no server.

---

## 10. Tech stack and architecture

| Concern | Choice | Why |
|---|---|---|
| Framework | React + Vite + TypeScript | Fast to build with Claude Code; TypeScript catches data-shape mistakes. |
| Routing | React Router | Map, Place, Buckets, List, Profile routes. |
| State | Zustand with `persist` | Small, simple, persists to localStorage. |
| Map | MapLibre GL JS with OpenFreeMap tiles | Free, no API key, and the map style can be recolored and stripped of other businesses so Bucket's pins stand out. Start with OpenFreeMap's muted "positron" style. Check OpenFreeMap's current terms and style URLs. |
| Photos | `idb-keyval` (IndexedDB) | Simple key/value storage for image blobs. |
| Icons | Lucide | Consistent line icons; no emoji as icons. |
| Tests | Vitest | Unit tests for ranking, scores, and the distance gate. |
| Hosting | Netlify or Vercel (free) | Phone browsers only allow camera and location on HTTPS pages. Deploy early and test on a real phone. |

**Testing on a phone during development:** deploying a preview build to Netlify or Vercel is the least painful route. Running the Vite dev server over HTTPS on your local network also works (`@vitejs/plugin-basic-ssl`), but iPhones complain about the self-signed certificate.

### Project structure

```
src/
  data/
    places.json
    lists.json
    friends.json          # generated by scripts/seedFriends.ts
  lib/
    ranking.ts            # binary insertion, comparison stepping, undo
    scores.ts             # score bands, friends' average
    geo.ts                # haversine, collect gate
    photos.ts             # resize + IndexedDB
    store.ts              # Zustand store (collections, rankings, settings)
  components/
    MapView.tsx
    PlacePin.tsx
    PlaceSheet.tsx
    BucketFill.tsx
    ComparisonCards.tsx
    SimulatedBanner.tsx
  screens/
    MapScreen.tsx
    PlaceScreen.tsx
    CollectFlow.tsx
    RankFlow.tsx
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

**Target for Demo 4:** about 30–50 places.
- Mostly **Austin Local** places, including real hidden gems. Pick places you'd actually go to; the demo is stronger if some of them are your own finds, like the cave on Mount Bonnell.
- A handful of **State Treasures** (for example, the Texas State Capitol, Enchanted Rock).
- **3–4 Legendary** places across the US, each using one classic spot (for example, Old Faithful itself, a named Grand Canyon viewpoint).
- **2–3 curated Austin lists** of 5–15 places each, at least one of them a destination list (for example, "Zilker Park").

**Coordinates:** take them from a map (in Google Maps, right-click a spot and click the coordinates to copy them). Don't let AI guess coordinates; a wrong pin breaks the location check.

Example entry format (coordinates intentionally left as placeholders):

```json
{
  "id": "mount-bonnell",
  "name": "Mount Bonnell",
  "description": "Limestone overlook above Lake Austin with one of the best views in the city.",
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
| `water` | `#2E86DE` | Bucket water, primary buttons |
| `water-deep` | `#1F5FA8` | Water depth gradient, pressed states |
| `tier-local` | `#2E86DE` | Local pins (circle) |
| `tier-state` | `#C8962E` | State Treasure pins (shield) |
| `tier-legendary` | white star with a pale pastel ring (`#F4D9F5` → `#D9F0F7` → `#F7F0D2`) | Legendary pins (star) |
| `sim-banner` | `#F2B705` on `#1D2731` text | Simulated-location banner |
| Radius | 14 px cards, fully rounded chips | |
| Spacing | 4 px scale (4, 8, 12, 16, 24, 32) | |
| Tap targets | at least 44 × 44 px | |
| Fonts | One distinctive heading font plus the system UI font for body text. Pick the heading font yourself. | |

### Pins
- Shape encodes tier: **circle** = Local, **shield** = State Treasure, **star** = Legendary.
- **Collected** = filled. **Not collected** = white fill with a colored outline.
- Clustering at low zoom is a stretch goal; 30–50 pins spread across Austin should be readable without it.

### Bucket fill (Demo 4)
- An SVG bucket (tapered body with a handle). Water is a shape clipped to the bucket's interior, with a gently moving surface wave.
- When a collect raises the level, animate over about 900 ms with a slight overshoot and settle, so the water sloshes.
- **Stretch goal:** a drop falls in and causes a splash. The standard technique is a row of about 30 springs along the water surface, each pulled back to rest and spreading its motion to neighbors. Starting values to tune: tension 0.025, damping 0.025, spread 0.25.
- With the phone's **reduce motion** setting on, skip the wave and splash and just show the new level.

### Avoid
- Emoji as icons
- Purple-to-blue gradients
- Glass or blur effects outside the Cycle 5 trophies
- Heavy drop shadows on every card

### Working with Claude Code on visuals
- Build and review **one screen at a time on a real phone**.
- Give specific feedback ("the Collect button is too high to reach"), not "make it look better."
- Reference other apps for **behavior**, not looks: a bottom sheet like Google Maps, two-card comparisons like Beli.

---

## 13. Testing

### Automated (Vitest)
- **Ranking:** for every group size from 0 to 15 and every possible final position, simulate the answers and assert the comparison count is ≤ 4 and the place lands in the right position. Test "too tough to call" and undo.
- **Scores:** band edges, a group of one, rounding, friends' average with 0, 1, and several friends.
- **Geo:** haversine against known distances; collect gate passes at exactly the radius, fails just beyond it, and fails when accuracy exceeds 75 m regardless of distance; simulated mode passes.

### Manual phone checklist
- [ ] App loads over HTTPS on iPhone Safari
- [ ] Location permission explanation appears before the browser prompt
- [ ] Real collect at an actual place succeeds with simulation off
- [ ] "Too far" message shows the correct distance
- [ ] Camera opens; photo saves and shows on the place page after reload
- [ ] Ranking flow completes in ≤ 4 comparisons; undo works
- [ ] Place page shows your rank and friends' average
- [ ] Bucket level updates after a collect; completed bucket shows its full state
- [ ] Simulated-location banner is visible on every screen while the mode is on
- [ ] Reset all data clears collections, rankings, and photos

---

## 14. Build plan and demo prep

### Schedule (Demo 4 due Friday, October 16, 11:59 PM)

| When | Work |
|---|---|
| **Wed evening** | Scaffold the app (Vite, routing, store). Write seed data. Map with tier-styled pins, filters, and the place bottom sheet. Deploy a first build to Netlify or Vercel. |
| **Thu** | Collect flow (location gate, simulated mode, photo capture and storage). Ranking flow and its tests. Score math and the friend seed script. Place page. |
| **Fri morning** | Buckets and list screens with the fill animation. Profile and settings. Phone checklist. |
| **Fri afternoon** | Fix what the checklist finds. Do one real collect at an actual place. Record the demo video. Write the Demo 4 submission. |

**If time runs short, cut in this order:** splash physics → profile photo grid → list screen details → "too tough to call." Never cut the location gate, the ranking flow, or friends' averages; those are the three goals.

### Demo video (3–5 minutes)
- **Context (20–30 s):** the user and what this version set out to do.
- **Walkthrough (2–3 min):** browse the map → open a place with friends' scores → collect one place for real → rank it → watch a bucket fill → show a Legendary place collected with simulated location, with the banner visible.
- **Reflection (20–30 s):** what worked, what didn't, what changes next (native iOS, trophies).

### What to disclose as mocked or incomplete
- Friends are simulated, with seeded rankings.
- Collections of places you can't visit are done in simulated-location mode (banner visible).
- All data, including photos, is stored only on the device; there are no accounts or server.
- Places and lists are hand-curated; there is no user submission.

Keep this list updated during the build; it becomes section C of the Demo 4 written submission.

---

## 15. Iteration log

Section E of the Demo submission asks for iterations in Before / Learning / Change / Result form. These are the design decisions made since Pitch 4. Add build-time iterations as they happen.

**1. Collection radius**
- **Before:** a fixed 100 m radius for every place.
- **Learning:** places vary hugely in size. 100 m is too tight for a large pool and too loose for a mural.
- **Change:** each place has its own radius, defaulting to 100 m.
- **Result:** the location check matches the real size of each place.

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
- **Result:** a comparable number, and goal 3 is refined accordingly.

---

## 16. Cycle 5 roadmap (October 23 – November 13)

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
Play one full animation and show the rest as chips. Priority: a list that just completed, then the list the user was viewing, then the list closest to complete. A Legendary trophy always takes the main animation.

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
- **Golden Gate Bridge** and similar borderline cases: apply the symbol test and record the decision.
- **Effort vs. prestige:** completing a 10-place list (silver) takes more effort than one visit to a State Treasure (gold). Acceptable if metals mean fame and list completion gets its own overflow celebration; revisit after user feedback.
- **Heading font:** to be chosen.
