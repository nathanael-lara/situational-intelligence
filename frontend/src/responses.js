// ============================================================================
// Spoken-response classification
// Pure keyword matching for the voice confirmation flow, kept DOM-free so it
// can be unit-tested without the speech/camera machinery in voiceCheck.js.
// ============================================================================

export const CONFIRM_NO_WORDS = ['no', 'cancel', 'stop', "don't", 'never mind', 'nevermind', 'false alarm'];
export const CONFIRM_YES_WORDS = ['yes', 'confirm', 'help', 'please', 'do it', 'send help'];
export const LISTEN_YES_WORDS = ['yes', 'yeah', 'help', 'please', 'need help', 'help me', 'ambulance', 'emergency', 'somebody', 'uh huh', 'mm hmm', 'mhm'];
export const LISTEN_NO_WORDS = ['no', 'nope', "i'm fine", "i'm okay", "i'm good", 'im fine', 'im okay', 'go away', 'leave me alone', 'stop', 'fine', 'all good', "don't need"];

/**
 * Classify a spoken transcript as 'yes' | 'no' | null.
 * In 'confirm' mode a denial takes priority (an explicit cancel wins); in
 * 'listen' mode an affirmative takes priority. Pure — no side effects.
 * @param {string} text transcript
 * @param {'listen'|'confirm'} mode
 * @returns {'yes'|'no'|null}
 */
export function classifyResponse(text, mode = 'listen') {
  const t = (text || '').toLowerCase();
  if (mode === 'confirm') {
    if (CONFIRM_NO_WORDS.some(w => t.includes(w))) return 'no';
    if (CONFIRM_YES_WORDS.some(w => t.includes(w))) return 'yes';
    return null;
  }
  if (LISTEN_YES_WORDS.some(w => t.includes(w))) return 'yes';
  if (LISTEN_NO_WORDS.some(w => t.includes(w))) return 'no';
  return null;
}
