import { useCallback, useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';

import { todayKey } from './energy';
import { useStore } from './store';
import { fetchLatest, subscribe, SyncedSteps } from './sync';

/** Keeps today's steps in step with what the iPhone Shortcut last sent. Returns a manual pull. */
export function useStepSync() {
  const { state, update } = useStore();
  const id = state.syncId;
  const last = useRef(0);

  const apply = useCallback(
    (s: SyncedSteps) => {
      if (s.at.getTime() < last.current) return;
      last.current = s.at.getTime();
      update((st) => {
        const key = todayKey();
        const cur = st.steps[key];
        // A manual screenshot reading newer than the last sync wins; anything from Health is replaced.
        if (cur && cur.source === 'screenshot' && new Date(cur.updatedAt) > s.at) return st;
        if (cur && cur.source === 'health' && cur.count === s.count) return st;
        return { ...st, steps: { ...st.steps, [key]: { count: s.count, source: 'health', updatedAt: s.at.toISOString() } } };
      });
    },
    [update],
  );

  const pull = useCallback(async () => {
    if (!id) return false;
    try {
      const s = await fetchLatest(id);
      if (s) apply(s);
      return !!s;
    } catch {
      return false;
    }
  }, [id, apply]);

  useEffect(() => {
    if (!id || Platform.OS !== 'web') return;
    pull();
    const stop = subscribe(id, apply);
    const timer = setInterval(pull, 60_000);
    const onVis = () => document.visibilityState === 'visible' && pull();
    document.addEventListener('visibilitychange', onVis);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && pull());
    return () => {
      stop();
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVis);
      sub.remove();
    };
  }, [id, pull, apply]);

  return pull;
}
