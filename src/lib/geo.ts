// Distance and the collect check (section 8).

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Position extends LatLng {
  accuracy: number; // meters, as reported by the browser
}

export const MAX_ACCURACY_M = 75;
export const APPROXIMATE_ACCURACY_M = 1000;

const EARTH_RADIUS_M = 6371008.8;

export function haversine(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type CollectResult =
  | { kind: 'ok'; distanceM: number }
  | { kind: 'tooFar'; distanceM: number }
  | { kind: 'approximate'; distanceM: number }
  | { kind: 'weakSignal'; distanceM: number; accuracyM: number };

/** The check on a known distance; split out so the boundary can be tested exactly. */
export function checkDistance(distanceM: number, accuracyM: number, radiusM: number): CollectResult {
  const d = distanceM;
  if (d - accuracyM > radiusM) return { kind: 'tooFar', distanceM: d }; // too far even in the best case
  if (accuracyM > APPROXIMATE_ACCURACY_M) return { kind: 'approximate', distanceM: d };
  if (accuracyM > MAX_ACCURACY_M) return { kind: 'weakSignal', distanceM: d, accuracyM };
  if (d <= radiusM + accuracyM / 2) return { kind: 'ok', distanceM: d };
  return { kind: 'tooFar', distanceM: d };
}

export function collectCheck(place: LatLng & { radiusM: number }, pos: Position): CollectResult {
  return checkDistance(haversine(pos, place), pos.accuracy, place.radiusM);
}

/** Simulated-location mode: standing at the place with perfect signal. */
export function simulatedPosition(place: LatLng): Position {
  return { lat: place.lat, lng: place.lng, accuracy: 0 };
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  if (m < 100_000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m / 1000).toLocaleString('en-US')} km`;
}
