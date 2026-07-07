import { describe, it, expect } from 'vitest';
import { parseVisionResponse } from '../src/providers/visionProvider.js';

describe('parseVisionResponse', () => {
  it('parses a plain JSON text block', () => {
    const content = [{ type: 'text', text: '{"threat_level":"NORMAL","people_count":0}' }];
    expect(parseVisionResponse(content)).toEqual({ threat_level: 'NORMAL', people_count: 0 });
  });

  it('strips a ```json code fence', () => {
    const content = [{ type: 'text', text: '```json\n{"ok":true}\n```' }];
    expect(parseVisionResponse(content)).toEqual({ ok: true });
  });

  it('joins multiple text parts before parsing', () => {
    const content = [{ text: '{"a":1,' }, { text: '"b":2}' }];
    expect(parseVisionResponse(content)).toEqual({ a: 1, b: 2 });
  });

  it('tolerates a missing/empty content array by throwing a parse error', () => {
    expect(() => parseVisionResponse([])).toThrow();
    expect(() => parseVisionResponse(undefined)).toThrow();
  });
});
