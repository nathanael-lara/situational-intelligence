import { describe, it, expect } from 'vitest';
import { computeMotionPercent, MOTION_PIXEL_THRESHOLD } from '../src/motion.js';

// Build an RGBA buffer of `count` pixels, every channel set to `value`.
function frame(count, value) {
  return new Uint8ClampedArray(count * 4).fill(value);
}

describe('computeMotionPercent', () => {
  it('reports 0% for identical frames', () => {
    const a = frame(4, 100);
    const b = frame(4, 100);
    expect(computeMotionPercent(a, b, 2, 2)).toBe(0);
  });

  it('reports 100% when every pixel changes past the threshold', () => {
    const curr = frame(4, 255);
    const prev = frame(4, 0);
    expect(computeMotionPercent(curr, prev, 2, 2)).toBe(100);
  });

  it('counts a pixel only when the mean RGB delta exceeds the threshold', () => {
    // 1 pixel. Delta of exactly threshold on each channel => mean == threshold => not counted.
    const atThreshold = new Uint8ClampedArray([MOTION_PIXEL_THRESHOLD, MOTION_PIXEL_THRESHOLD, MOTION_PIXEL_THRESHOLD, 255]);
    const zero = new Uint8ClampedArray([0, 0, 0, 255]);
    expect(computeMotionPercent(atThreshold, zero, 1, 1)).toBe(0);

    // One above threshold => mean > threshold => counted => 100% of the single pixel.
    const above = new Uint8ClampedArray([MOTION_PIXEL_THRESHOLD + 1, MOTION_PIXEL_THRESHOLD + 1, MOTION_PIXEL_THRESHOLD + 1, 255]);
    expect(computeMotionPercent(above, zero, 1, 1)).toBe(100);
  });

  it('ignores the alpha channel', () => {
    const curr = new Uint8ClampedArray([10, 10, 10, 0]);
    const prev = new Uint8ClampedArray([10, 10, 10, 255]);
    expect(computeMotionPercent(curr, prev, 1, 1)).toBe(0);
  });

  it('reports 50% when half the pixels move', () => {
    // 2 pixels: first unchanged, second fully changed.
    const curr = new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255]);
    const prev = new Uint8ClampedArray([0, 0, 0, 255, 0, 0, 0, 255]);
    expect(computeMotionPercent(curr, prev, 2, 1)).toBe(50);
  });
});
