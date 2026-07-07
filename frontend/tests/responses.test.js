import { describe, it, expect } from 'vitest';
import { classifyResponse } from '../src/responses.js';

describe('classifyResponse — listen mode', () => {
  it('detects affirmatives', () => {
    expect(classifyResponse('yes please help me', 'listen')).toBe('yes');
    expect(classifyResponse('I need help', 'listen')).toBe('yes');
    expect(classifyResponse('call an ambulance', 'listen')).toBe('yes');
  });

  it('detects denials', () => {
    expect(classifyResponse("no I'm fine", 'listen')).toBe('no');
    expect(classifyResponse('leave me alone', 'listen')).toBe('no');
  });

  it('returns null when nothing matches', () => {
    expect(classifyResponse('the weather is nice', 'listen')).toBe(null);
    expect(classifyResponse('', 'listen')).toBe(null);
    expect(classifyResponse(undefined, 'listen')).toBe(null);
  });

  it('is case-insensitive', () => {
    expect(classifyResponse('YES HELP', 'listen')).toBe('yes');
  });

  it('prioritizes affirmatives in listen mode', () => {
    // contains both a yes-word ("help") and a no-word ("stop")
    expect(classifyResponse('help, please stop the bleeding', 'listen')).toBe('yes');
  });
});

describe('classifyResponse — confirm mode', () => {
  it('prioritizes denial (explicit cancel wins)', () => {
    // "help" is a confirm-yes word, "cancel" is a confirm-no word — no must win
    expect(classifyResponse('no cancel I said help by mistake', 'confirm')).toBe('no');
    expect(classifyResponse('false alarm', 'confirm')).toBe('no');
  });

  it('confirms when only affirmatives present', () => {
    expect(classifyResponse('yes confirm send help', 'confirm')).toBe('yes');
    expect(classifyResponse('do it', 'confirm')).toBe('yes');
  });

  it('returns null when nothing matches', () => {
    expect(classifyResponse('hmm unsure maybe', 'confirm')).toBe(null);
  });

  // Documents (does not endorse) the current substring-matching behavior:
  // "not" contains "no", so a hesitation like "not sure" is read as a denial.
  // Captured here so any future move to word-boundary matching is a conscious change.
  it('KNOWN QUIRK: substring match means "not" triggers a denial', () => {
    expect(classifyResponse('not sure', 'confirm')).toBe('no');
  });
});
