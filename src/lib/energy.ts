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
  /** Energy the body has burned at rest up to now; food up to this amount owes no steps. */
  budgetSoFar: number;
  /** Today's bill in steps: food eaten beyond what the body has burned so far, capped at MAX_STEP_GOAL. 0 when nothing is owed. */
  stepGoal: number;
  /** Steps still owed right now: stepGoal minus steps walked. */
  stepsLeft: number;
  /** Real-time net energy: intake − (base so far + walking). Negative = deficit. */
  netNow: number;
  /** intake − base − walking, for the full day. Negative = deficit. */
  balance: number;
  /** Extra kcal beyond the step cap that walking alone can't cover. */
  overCap: number;
}

export function summarize(p: Profile, intake: number, steps: number, now?: Date): DaySummary {
  const base = baseBurn(p);
  const budget = dailyBudget(p);
  const frac = now ? dayFraction(now) : 1;
  const baseSoFar = Math.round(base * frac);
  // Steps follow the plain energy balance (eaten − burned so far), so a negative net never owes steps.
  const budgetSoFar = baseSoFar;
  // Real time: only what the body has actually burned up to now offsets the food eaten.
  const owedKcal = Math.max(0, intake - budgetSoFar);
  const raw = kcalToSteps(p, owedKcal);
  const stepGoal = Math.min(MAX_STEP_GOAL, raw);
  const overCap = raw > MAX_STEP_GOAL ? owedKcal - stepsToKcal(p, MAX_STEP_GOAL) : 0;
  const walkKcal = stepsToKcal(p, steps);
  return {
    intake,
    base,
    baseSoFar,
    walkKcal,
    steps,
    budget,
    budgetSoFar,
    stepGoal,
    stepsLeft: Math.max(0, stepGoal - steps),
    netNow: intake - baseSoFar - walkKcal,
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
