# Bucket

A collecting game for real places: go there, take a photo to collect it, rank it head-to-head, and see how your friends ranked it. See [DESIGN.md](DESIGN.md) for the full design.

This is the Demo 4 web prototype. It runs locally in a laptop browser, laid out as a phone-width app.

## Run it

```sh
npm install
npm run dev        # http://localhost:5173 (localhost counts as secure, so camera and location work)
```

Open it in Chrome. For the demo, go to **Profile → Load demo profile** first.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm test` | Unit tests (ranking, scores, distance gate, bucket priority) |
| `npm run build` | Typecheck and production build |
| `npm run lint` | oxlint |
| `npm run seed:friends` | Regenerates `src/data/friends.json` from `places.json` with a fixed seed |

## Where things live

- `src/data/`: seed places, lists, simulated friends, and the demo profile
- `src/lib/`: ranking (binary insertion), scores, geo (collect check), photos (IndexedDB), store (Zustand + localStorage)
- `src/screens/`, `src/components/`: UI
- `tests/`: Vitest

## Seed data notes

- Coordinates come from OpenStreetMap (Nominatim and Overpass), not from memory. **Capital Factory's pin still needs checking on site.**
- Backup live-collect place: the *Hi, How Are You* mural at 21st and Guadalupe (`hi-how-are-you-mural`), in the "Only in Austin" list.
- After loading the demo profile, "Only in Austin" sits at 4/6, so collecting Capital Factory and then the mural completes it.
- When adding a place, also give it a hidden quality value in `scripts/seedFriends.ts`, then rerun `npm run seed:friends`.
