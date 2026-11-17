// Calls Google Gemini directly from the device with the user's own API key.
// The key never leaves the device except to Google's API.

const BASE = 'https://generativelanguage.googleapis.com/v1beta';
// Tried in order; aliases first so the app keeps working as Google rotates models.
const MODELS = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash'];

export class QuotaError extends Error {}
export class KeyError extends Error {}

export async function validateKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/models?pageSize=1`, { headers: { 'x-goog-api-key': key } });
    return res.ok;
  } catch {
    return false;
  }
}

async function generate(key: string, prompt: string, imageBase64: string): Promise<unknown> {
  let lastErr: unknown = null;
  for (const model of MODELS) {
    const res = await fetch(`${BASE}/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } }],
          },
        ],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      }),
    });
    if (res.status === 429) throw new QuotaError('quota');
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      const body = await res.text();
      if (/API_KEY|PERMISSION|api key/i.test(body)) throw new KeyError(body);
      lastErr = new Error(body);
      continue;
    }
    if (res.status === 404) {
      lastErr = new Error(`model ${model} not found`);
      continue;
    }
    if (!res.ok) {
      lastErr = new Error(`HTTP ${res.status}`);
      continue;
    }
    const json = await res.json();
    const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      lastErr = new Error('empty');
      continue;
    }
    return JSON.parse(text.replace(/^```json\s*|```$/g, ''));
  }
  throw lastErr ?? new Error('no model');
}

export interface FoodGuess {
  nameTh: string;
  nameEn: string;
  kcal: number;
  kcalLow: number;
  kcalHigh: number;
}

export interface FoodResult {
  isFood: boolean;
  best: FoodGuess;
  alternatives: FoodGuess[];
}

const FOOD_PROMPT = `You are a nutrition assistant for a Thai calorie app.
Look at the photo and identify the meal. Thai street food and home cooking are common.
Estimate the portion actually shown (typical Thai single-plate sizes) and total calories,
including cooking oil, coconut milk, sugar and sauces you can reasonably infer.
Respond ONLY with JSON of this shape:
{"is_food": boolean,
 "best": {"name_th": string, "name_en": string, "kcal": number, "kcal_low": number, "kcal_high": number},
 "alternatives": [{"name_th": string, "name_en": string, "kcal": number, "kcal_low": number, "kcal_high": number}]}
"alternatives" holds up to 2 other plausible dishes. If several foods are on the table, "best" is the whole meal combined,
named like "ข้าวมันไก่ + น้ำอัดลม". If it is not food, set is_food false and use 0 for numbers.`;

function toGuess(g: any): FoodGuess {
  const kcal = Math.max(0, Math.round(Number(g?.kcal) || 0));
  return {
    nameTh: String(g?.name_th ?? g?.name_en ?? '?'),
    nameEn: String(g?.name_en ?? g?.name_th ?? '?'),
    kcal,
    kcalLow: Math.round(Number(g?.kcal_low) || kcal * 0.8),
    kcalHigh: Math.round(Number(g?.kcal_high) || kcal * 1.2),
  };
}

export async function analyzeFood(key: string, imageBase64: string): Promise<FoodResult> {
  const r: any = await generate(key, FOOD_PROMPT, imageBase64);
  return {
    isFood: Boolean(r?.is_food),
    best: toGuess(r?.best),
    alternatives: Array.isArray(r?.alternatives) ? r.alternatives.slice(0, 2).map(toGuess) : [],
  };
}

const STEPS_PROMPT = `This is a screenshot of a phone step-counter or health app (Apple Health, Samsung Health,
Google Fit, Mi Fitness, etc.). Find today's total step count.
Respond ONLY with JSON: {"steps": number | null}. Use null if no step count is visible.`;

export async function readSteps(key: string, imageBase64: string): Promise<number | null> {
  const r: any = await generate(key, STEPS_PROMPT, imageBase64);
  const n = Number(r?.steps);
  return Number.isFinite(n) && n >= 0 && n < 200000 ? Math.round(n) : null;
}
