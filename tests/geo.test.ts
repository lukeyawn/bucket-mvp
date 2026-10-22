import { describe, expect, it } from 'vitest';
import { checkDistance, collectCheck, formatDistance, haversine, simulatedPosition } from '../src/lib/geo';

describe('haversine', () => {
  it('is zero for the same point', () => {
    expect(haversine({ lat: 30.27, lng: -97.74 }, { lat: 30.27, lng: -97.74 })).toBe(0);
  });

  it('matches one degree of latitude (~111.2 km)', () => {
    expect(haversine({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(111_195, -1);
  });

  it('matches a known city distance: Austin to Dallas is about 293 km', () => {
    // Texas State Capitol to Dallas City Hall
    const d = haversine({ lat: 30.2747, lng: -97.7404 }, { lat: 32.7763, lng: -96.7969 });
    expect(d / 1000).toBeGreaterThan(285);
    expect(d / 1000).toBeLessThan(300);
  });

  it('matches a known long distance: New York to Los Angeles is about 3,940 km', () => {
    const d = haversine({ lat: 40.7128, lng: -74.006 }, { lat: 34.0522, lng: -118.2437 });
    expect(d / 1000).toBeGreaterThan(3925);
    expect(d / 1000).toBeLessThan(3950);
  });
});

describe('collect check (goal 1)', () => {
  it('passes at exactly radius + accuracy / 2', () => {
    expect(checkDistance(100 + 30, 60, 100).kind).toBe('ok');
    expect(checkDistance(40 + 37.5, 75, 40).kind).toBe('ok');
  });

  it('fails just beyond radius + accuracy / 2', () => {
    expect(checkDistance(130.01, 60, 100).kind).toBe('tooFar');
    expect(checkDistance(77.51, 75, 40).kind).toBe('tooFar');
  });

  it('passes inside the radius with perfect accuracy', () => {
    expect(checkDistance(0, 0, 40).kind).toBe('ok');
    expect(checkDistance(100, 0, 100).kind).toBe('ok');
  });

  it('never passes when accuracy exceeds 75 m', () => {
    for (const acc of [75.01, 80, 120, 500, 999, 1000, 1001, 5000]) {
      for (const d of [0, 10, 50, 100, 200]) {
        expect(checkDistance(d, acc, 100).kind).not.toBe('ok');
      }
    }
  });

  it('reports weak signal when accuracy is between 75 m and 1 km', () => {
    expect(checkDistance(50, 120, 100)).toEqual({ kind: 'weakSignal', distanceM: 50, accuracyM: 120 });
  });

  it('reports too far rather than weak signal when distance − accuracy > radius', () => {
    expect(checkDistance(2300, 120, 100).kind).toBe('tooFar');
    expect(checkDistance(5000, 1500, 100).kind).toBe('tooFar');
  });

  it('reports approximate when accuracy exceeds 1 km', () => {
    expect(checkDistance(500, 1500, 100).kind).toBe('approximate');
  });

  it('works end to end on coordinates', () => {
    const place = { lat: 30.2690545, lng: -97.7406886, radiusM: 75 };
    // ~100 m north of the place
    const near = { lat: place.lat + 0.0009, lng: place.lng, accuracy: 20 };
    expect(collectCheck(place, near).kind).toBe('tooFar'); // 100 > 75 + 10
    expect(collectCheck(place, { ...near, accuracy: 60 }).kind).toBe('ok'); // 100 <= 75 + 30
    const r = collectCheck(place, { lat: 30.3207674, lng: -97.7733474, accuracy: 30 });
    expect(r.kind).toBe('tooFar');
    expect(r.distanceM).toBeGreaterThan(6000);
  });

  it('passes in simulated mode', () => {
    const place = { lat: 44.4604641, lng: -110.8281464, radiusM: 40 };
    expect(collectCheck(place, simulatedPosition(place)).kind).toBe('ok');
  });
});

describe('formatDistance', () => {
  it('formats meters and kilometers', () => {
    expect(formatDistance(85.4)).toBe('85 m');
    expect(formatDistance(2300)).toBe('2.3 km');
    expect(formatDistance(1_234_567)).toBe('1,235 km');
  });
});
