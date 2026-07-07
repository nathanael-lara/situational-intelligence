// ============================================================================
// Motion gating
// Decides whether a given scan tick is worth sending to the vision provider.
// The scanner runs on a fixed timer, but calling Claude Vision on every tick
// of an empty, motionless scene wastes tokens and latency. This gate skips the
// call when the scene is calm AND still — while guaranteeing a periodic
// "heartbeat" scan so stationary hazards (fire, smoke, flooding), which do not
// move pixels, are still caught.
//
// Pure and side-effect free so it can be unit-tested without a browser.
// ============================================================================

/**
 * @param {object} s
 * @param {number}  s.motion               current motion %, from the pixel-diff
 * @param {string}  s.tier                 'low' | 'elevated'
 * @param {number}  s.escalationCount      number of active escalations
 * @param {string}  s.askState             voice-check state machine ('idle' when calm)
 * @param {boolean} s.isFirstScan          true on the very first tick (needs a baseline)
 * @param {number}  s.skippedSinceLastScan consecutive ticks skipped so far
 * @param {number}  s.threshold            motion % at/above which we always scan
 * @param {number}  s.heartbeatTicks       force a scan after this many skips
 * @returns {boolean} true = run the full vision scan this tick
 */
export function shouldScan({
  motion,
  tier,
  escalationCount,
  askState,
  isFirstScan,
  skippedSinceLastScan,
  threshold,
  heartbeatTicks,
}) {
  // Always scan the first frame — establishes the scene baseline.
  if (isFirstScan) return true;
  // Never gate an active situation.
  if (tier === 'elevated') return true;
  if (escalationCount > 0) return true;
  if (askState !== 'idle') return true;
  // Something is moving — worth a look.
  if (motion >= threshold) return true;
  // Calm and still, but force a heartbeat scan so we don't go blind to
  // stationary hazards (fire/smoke don't register as motion).
  if (skippedSinceLastScan >= heartbeatTicks) return true;
  return false;
}
