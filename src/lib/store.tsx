import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Profile, todayKey } from './energy';
import { Lang, TKey, translate } from './i18n';

export interface Meal {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // ISO
  nameTh: string;
  nameEn: string;
  kcal: number;
  thumb?: string; // small data URI
}

export interface StepEntry {
  count: number;
  source: 'shortcut' | 'screenshot' | 'health';
  updatedAt: string;
}

export interface State {
  lang: Lang;
  profile: Profile | null;
  apiKey: string | null;
  meals: Meal[];
  steps: Record<string, StepEntry>;
  aiUsage: Record<string, number>;
}

const initial: State = {
  lang: 'th',
  profile: null,
  apiKey: null,
  meals: [],
  steps: {},
  aiUsage: {},
};

const KEY = 'moo-state-v1';

interface Ctx {
  ready: boolean;
  state: State;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  update: (fn: (s: State) => State) => void;
  addMeal: (m: Meal) => void;
  removeMeal: (id: string) => void;
  setSteps: (date: string, count: number, source: StepEntry['source']) => void;
  bumpAi: () => void;
  reset: () => void;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setState({ ...initial, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const update = useCallback((fn: (s: State) => State) => setState(fn), []);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      state,
      t: (key, vars) => translate(state.lang, key, vars),
      update,
      addMeal: (m) => update((s) => ({ ...s, meals: [...s.meals, m] })),
      removeMeal: (id) => update((s) => ({ ...s, meals: s.meals.filter((m) => m.id !== id) })),
      setSteps: (date, count, source) =>
        update((s) => ({
          ...s,
          steps: { ...s.steps, [date]: { count, source, updatedAt: new Date().toISOString() } },
        })),
      bumpAi: () =>
        update((s) => {
          const d = todayKey();
          return { ...s, aiUsage: { ...s.aiUsage, [d]: (s.aiUsage[d] ?? 0) + 1 } };
        }),
      reset: () => update(() => ({ ...initial, lang: state.lang })),
    }),
    [ready, state, update],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore outside StoreProvider');
  return ctx;
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
