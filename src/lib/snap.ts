import { router } from 'expo-router';
import { useState } from 'react';

import { pickImage } from './image';
import { setPending } from './pending';
import { useStore } from './store';

/** Pick a food photo (camera or library) and open the food screen. Must run from a tap on web. */
export function useSnap() {
  const { state } = useStore();
  const [busy, setBusy] = useState<'camera' | 'library' | null>(null);
  const snap = async (source: 'camera' | 'library') => {
    if (!state.apiKey) return router.push('/connect-ai');
    setBusy(source);
    try {
      const p = await pickImage(source);
      if (p) {
        setPending(p);
        router.push('/food');
      }
    } finally {
      setBusy(null);
    }
  };
  return { busy, snap };
}
