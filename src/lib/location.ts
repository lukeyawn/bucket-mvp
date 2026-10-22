import { create } from 'zustand';
import type { Position } from './geo';

// Location is read once at launch for the map dot and again on each Collect. No background tracking.

export type LocationError = 'blocked' | 'failed';

export function getPosition(): Promise<Position> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject('blocked' satisfies LocationError);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      (err) => reject((err.code === err.PERMISSION_DENIED ? 'blocked' : 'failed') satisfies LocationError),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  });
}

interface HereState {
  pos: Position | null;
  error: LocationError | null;
}

/** The "you are here" position for the map. */
export const useHere = create<HereState>(() => ({ pos: null, error: null }));

export function refreshHere(): Promise<void> {
  return getPosition().then(
    (pos) => useHere.setState({ pos, error: null }),
    (error: LocationError) => useHere.setState({ error }),
  );
}
