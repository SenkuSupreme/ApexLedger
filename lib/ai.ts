import OpenAI from 'openai';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

let openai: OpenAI | null = null;

if (OPENROUTER_API_KEY) {
  openai = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
  });
}

/**
 * Helper to call AI with retry logic (simple version).
 * Uses a free/cheap model by default.
 */
export async function queryAI(prompt: string, model: string = 'openai/gpt-3.5-turbo') {
  if (!openai) {
    console.warn('OPENROUTER_API_KEY is not set. AI features are disabled.');
    return null;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
    });

    return completion.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('AI API Query Error:', error);
    return null;
  }
}

// Prompt templates
export const PROMPTS = {
  SUGGEST_TAGS: (note: string) => `
    Analyze the following trade note and suggest short, relevant tags (max 5) with confidence scores (0-1). 
    Output ONLY a JSON array of objects: [{ "tag": "string", "confidence": number }].
    Note: "${note}"
  `,
  ANALYZE_SENTIMENT: (note: string) => `
    Analyze the sentiment of this trade journal entry.
    Output ONLY a JSON object with: { "sentiment": "positive"|"negative"|"neutral"|"stressed", "keywords": ["word1", "word2"] }.
    Entry: "${note}"
  `,
  EVALUATE_STRATEGY: (metrics: string) => `
    Evaluate this trading strategy based on the following metrics: ${metrics}.
    Provide a score (0-100) and brief improvement suggestions.
    Output ONLY JSON: { "score": number, "analysis": "string" }.
  `,
  SUGGEST_ENTRY_EXIT: (asset: string, timeframe: string, priceHistory: string) => `
    Analyze the following price history snippet for ${asset} on ${timeframe} timeframe.
    Suggest optimal entry and exit criteria with rationale.
    Output ONLY JSON: { "entry": "string", "exit": "string", "rationale": "string" }.
    Price History: "${priceHistory}"
  `,
  ANALYZE_PATTERNS: (trades: string) => `
    Analyze this batch of recent trades for recurring patterns and behavioral issues.
    Output ONLY JSON: { "patterns": ["string"], "issues": ["string"], "fixes": ["string"] }.
    Trades: ${trades}
  `,
  GENERATE_CHECKLIST: (strategyName: string, content: string) => `
    You are an institutional trading assistant. Analyze the following trading strategy: "${strategyName}".
    Content:
    "${content}"
    
    Based on this strategy, generate a concise, mechanical pre-trade checklist.
    Each item must be a clear, actionable rule (e.g., "Check for HTF displacement", "Verify 15m MSS").
    Return ONLY a JSON array of strings: ["Item 1", "Item 2", ...].
    Aim for 5-10 most critical items.
  `
};

