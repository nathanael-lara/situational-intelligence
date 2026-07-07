import { describe, it, expect } from 'vitest';
import { shouldScan } from '../src/gating.js';

// A calm, still baseline that the gate should skip.
const calm = {
  motion: 0,
  tier: 'low',
  escalationCount: 0,
  askState: 'idle',
  isFirstScan: false,
  skippedSinceLastScan: 0,
  threshold: 5,
  heartbeatTicks: 5,
};

describe('shouldScan', () => {
  it('skips a calm, still scene', () => {
    expect(shouldScan(calm)).toBe(false);
  });

  it('always scans the first frame', () => {
    expect(shouldScan({ ...calm, isFirstScan: true })).toBe(true);
  });

  it('never gates an elevated tier', () => {
    expect(shouldScan({ ...calm, tier: 'elevated' })).toBe(true);
  });

  it('scans while escalations are active', () => {
    expect(shouldScan({ ...calm, escalationCount: 1 })).toBe(true);
  });

  it('scans while a voice check is in progress', () => {
    expect(shouldScan({ ...calm, askState: 'attempt1_listening' })).toBe(true);
  });

  it('scans when motion reaches the threshold', () => {
    expect(shouldScan({ ...calm, motion: 5 })).toBe(true);
    expect(shouldScan({ ...calm, motion: 4 })).toBe(false);
  });

  it('forces a heartbeat scan after enough skips', () => {
    expect(shouldScan({ ...calm, skippedSinceLastScan: 5 })).toBe(true);
    expect(shouldScan({ ...calm, skippedSinceLastScan: 4 })).toBe(false);
  });
});
