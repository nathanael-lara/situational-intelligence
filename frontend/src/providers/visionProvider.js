// ============================================================================
// Claude Vision provider
// Single home for the Anthropic Messages API call that was previously
// duplicated inline in analysis.js and voiceCheck.js. Endpoint, headers,
// model, and response parsing all live here so there is exactly one place to
// swap the reasoning/vision backend (see providers/index.js).
// ============================================================================

const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
export const CLAUDE_VISION_MODEL = 'claude-sonnet-4-20250514';

/**
 * Pull the JSON payload out of a Claude Messages `content` array.
 * The model is prompted to reply with JSON only, but it sometimes wraps the
 * body in a ```json fence — strip that, then parse. Pure + exported so it can
 * be unit-tested without a network call.
 * @param {Array<{text?: string}>} content
 * @returns {any} parsed JSON
 */
export function parseVisionResponse(content) {
  const text = (content || [])
    .map((c) => c.text || '')
    .join('')
    .replace(/```json|```/g, '')
    .trim();
  return JSON.parse(text);
}

/**
 * Interchangeable vision/reasoning provider backed by Claude Vision.
 * Implements the `analyzeFrame` shape of the AnalysisProviders interface
 * sketched in TECH_SPEC.md, so an on-device/offline provider (YOLO, Ollama)
 * can be dropped in behind the same method later.
 */
export class ClaudeVisionProvider {
  /** @param {{ apiKey: string }} opts */
  constructor({ apiKey } = {}) {
    this.apiKey = apiKey;
    this.name = 'claude';
  }

  /**
   * Send one base64 JPEG frame + a text prompt to Claude Vision and return the
   * parsed JSON assessment.
   * @param {{ imageBase64: string, prompt: string, maxTokens?: number }} req
   * @returns {Promise<any>} parsed JSON from the model
   */
  async analyzeFrame({ imageBase64, prompt, maxTokens = 600 }) {
    const res = await fetch(ANTHROPIC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CLAUDE_VISION_MODEL,
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
              { type: 'text', text: prompt },
            ],
          },
        ],
      }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return parseVisionResponse(data.content);
  }
}
