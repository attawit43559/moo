// Energy math for Moo. All figures are estimates for everyday guidance, not medical advice.

export type Sex = 'm' | 'f';
export type Goal = 'lose' | 'maintain' | 'learn';

export interface Profile {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: Goal;
}

/** Net walking cost: about 0.5 kcal per kg of body weight per km, above resting. */
const NET_WALK_KCAL_PER_KG_KM = 0.5;
/** Sedentary activity factor applied to BMR (daily living without deliberate walking). */
const SEDENTARY_FACTOR = 1.2;
/** Daily deficit used for the weight-loss goal. */
const LOSE_DEFICIT_KCAL = 400;
export const MIN_STEP_GOAL = 6000;
export const MAX_STEP_GOAL = 20000;

/** Mifflin-St Jeor basal metabolic rate, kcal/day. */
export function bmr(p: Profile): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return Math.round(base + (p.sex === 'm' ? 5 : -161));
}

/** Calories the body uses in a day without deliberate walking. */
export function baseBurn(p: Profile): number {
  return Math.round(bmr(p) * SEDENTARY_FACTOR);
}

/** Stride length in metres, estimated from height. */
export function strideM(p: Profile): number {
  return (p.heightCm * (p.sex === 'm' ? 0.415 : 0.413)) / 100;
}

export function kcalPerStep(p: Profile): number {
  return NET_WALK_KCAL_PER_KG_KM * p.weightKg * (strideM(p) / 1000);
}

export function kcalToSteps(p: Profile, kcal: number): number {
  return Math.round(kcal / kcalPerStep(p));
}

export function stepsToKcal(p: Profile, steps: number): number {
  return Math.round(steps * kcalPerStep(p));
}

export function dailyBudget(p: Profile): number {
  return baseBurn(p) - (p.goal === 'lose' ? LOSE_DEFICIT_KCAL : 0);
}

/** Fraction of the day elapsed, used to show base burn "so far". */
export function dayFraction(now = new Date()): number {
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins / (24 * 60);
}

export interface DaySummary {
  intake: number;
  base: number; // full-day base burn
  baseSoFar: number;
  walkKcal: number;
  steps: number;
  budget: number;
  /** Steps needed so intake beyond the budget is walked off, clamped to sane limits. */
  stepGoal: number;
  /** intake − base − walking, for the full day. Negative = deficit. */
  balance: number;
  /** Extra kcal beyond the step cap that walking alone can't cover. */
  overCap: number;
}

export function summarize(p: Profile, intake: number, steps: number, now?: Date): DaySummary {
  const base = baseBurn(p);
  const budget = dailyBudget(p);
  const surplus = Math.max(0, intake - budget);
  const raw = kcalToSteps(p, surplus);
  const stepGoal = Math.min(MAX_STEP_GOAL, Math.max(MIN_STEP_GOAL, raw));
  const overCap = raw > MAX_STEP_GOAL ? surplus - stepsToKcal(p, MAX_STEP_GOAL) : 0;
  const walkKcal = stepsToKcal(p, steps);
  const frac = now ? dayFraction(now) : 1;
  return {
    intake,
    base,
    baseSoFar: Math.round(base * frac),
    walkKcal,
    steps,
    budget,
    stepGoal,
    balance: intake - base - walkKcal,
    overCap: Math.round(overCap),
  };
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
