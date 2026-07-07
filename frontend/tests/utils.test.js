import { describe, it, expect } from 'vitest';
import { hav } from '../src/utils.js';

describe('hav (haversine distance, km)', () => {
  it('is 0 for identical points', () => {
    expect(hav(40.7128, -74.006, 40.7128, -74.006)).toBe(0);
  });

  it('is ~111 km for one degree of latitude', () => {
    expect(hav(0, 0, 1, 0)).toBeCloseTo(111.19, 1);
  });

  it('matches a known city pair (NYC → LA ≈ 3936 km)', () => {
    const km = hav(40.7128, -74.006, 34.0522, -118.2437);
    expect(km).toBeGreaterThan(3910);
    expect(km).toBeLessThan(3960);
  });

  it('is symmetric', () => {
    const a = hav(51.5074, -0.1278, 48.8566, 2.3522); // London → Paris
    const b = hav(48.8566, 2.3522, 51.5074, -0.1278);
    expect(a).toBeCloseTo(b, 6);
  });
});
