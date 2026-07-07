import { S } from './state.js';

// Per-pixel mean-RGB delta above which a pixel counts as "changed".
export const MOTION_PIXEL_THRESHOLD = 12;

/**
 * Percentage of pixels that changed between two RGBA frame buffers.
 * Pure and DOM-free so it can be unit-tested.
 * @param {Uint8ClampedArray} curr current frame RGBA data
 * @param {Uint8ClampedArray} prev previous frame RGBA data
 * @param {number} width
 * @param {number} height
 * @param {number} [threshold] mean-RGB delta to count a pixel as changed
 * @returns {number} 0-100 motion percentage (rounded)
 */
export function computeMotionPercent(curr, prev, width, height, threshold = MOTION_PIXEL_THRESHOLD) {
  let diff = 0;
  const total = width * height;
  for (let i = 0; i < curr.length; i += 4) {
    if ((Math.abs(curr[i] - prev[i]) + Math.abs(curr[i + 1] - prev[i + 1]) + Math.abs(curr[i + 2] - prev[i + 2])) / 3 > threshold) diff++;
  }
  return Math.round(diff / total * 100);
}

export function compMot() {
  const vid = document.getElementById('vid'), c = document.getElementById('cap');
  const w = 160, h = 120;
  c.width = w; c.height = h;
  c.getContext('2d', { willReadFrequently: true }).drawImage(vid, 0, 0, w, h);
  const d = c.getContext('2d').getImageData(0, 0, w, h).data;
  if (!S.prevFrameData) { S.prevFrameData = new Uint8ClampedArray(d); return 0; }
  const p = computeMotionPercent(d, S.prevFrameData, w, h);
  S.prevFrameData = new Uint8ClampedArray(d);
  S.motion = p;
  S.motionHistory.push(p);
  if (S.motionHistory.length > 15) S.motionHistory.shift();
  const bar = document.getElementById('mF'), lbl = document.getElementById('mP');
  if (bar) { bar.style.width = Math.min(p * 2, 100) + '%'; bar.style.background = p < 5 ? '#ff1744' : p < 15 ? '#ffd600' : '#00e676'; }
  if (lbl) lbl.textContent = p + '%';
  document.getElementById('sM').textContent = p + '%';
  return p;
}

export function startMot() {
  S.motionInterval = setInterval(compMot, 400);
  document.getElementById('mB').style.display = 'block';
}

export function stopMot() {
  clearInterval(S.motionInterval);
  document.getElementById('mB').style.display = 'none';
  S.prevFrameData = null;
  S.motionHistory = [];
}
