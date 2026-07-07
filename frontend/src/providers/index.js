// ============================================================================
// Provider registry
// Resolves the active analysis provider. Today only Claude Vision is wired up,
// but selection is centralized here so the on-device / offline fallbacks
// described in TECH_SPEC.md (YOLO, Whisper, Ollama) can register alongside it
// without touching the call sites in analysis.js / voiceCheck.js.
// ============================================================================

import { S } from '../state.js';
import { ClaudeVisionProvider } from './visionProvider.js';

// name -> factory(apiKey) => provider instance
const VISION_PROVIDERS = {
  claude: (apiKey) => new ClaudeVisionProvider({ apiKey }),
};

// Which provider to use. A future settings toggle can flip this to an offline
// backend; the call sites never need to change.
export const ACTIVE_VISION_PROVIDER = 'claude';

/**
 * Get the active vision/reasoning provider, bound to the current API key.
 * @returns {import('./visionProvider.js').ClaudeVisionProvider}
 */
export function getVisionProvider() {
  const make = VISION_PROVIDERS[ACTIVE_VISION_PROVIDER] || VISION_PROVIDERS.claude;
  return make(S.apiKey);
}
