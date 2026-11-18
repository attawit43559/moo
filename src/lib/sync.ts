import { todayKey } from './energy';

/**
 * Background step sync for iPhone without a native app.
 * The "Moo" Shortcut (run by an iOS automation whenever chosen apps open or close)
 * publishes today's step count to a private ntfy.sh topic; the web app reads the latest one
 * when it opens and listens live while it stays open. Only a number is sent, never a name.
 */
export const SYNC_BASE = 'https://ntfy.sh';
const topic = (id: string) => `${SYNC_BASE}/moo-${id}`;

export interface SyncedSteps {
  count: number;
  at: Date;
}

function parse(line: string): SyncedSteps | null {
  try {
    const m = JSON.parse(line) as { event?: string; message?: string; time?: number };
    if (m.event !== 'message' || !m.message || !m.time) return null;
    const count = Math.round(Number(String(m.message).replace(/[^\d.]/g, '')));
    const at = new Date(m.time * 1000);
    if (!Number.isFinite(count) || count < 0 || todayKey(at) !== todayKey()) return null;
    return { count, at };
  } catch {
    return null;
  }
}

/** Latest count the Shortcut sent today, if any. */
export async function fetchLatest(id: string): Promise<SyncedSteps | null> {
  const res = await fetch(`${topic(id)}/json?poll=1&since=24h`);
  if (!res.ok) return null;
  const lines = (await res.text()).split('\n').filter(Boolean);
  let best: SyncedSteps | null = null;
  for (const l of lines) {
    const s = parse(l);
    if (s && (!best || s.at >= best.at)) best = s;
  }
  return best;
}

/** Live updates while the app is open. Returns an unsubscribe function. */
export function subscribe(id: string, onSteps: (s: SyncedSteps) => void): () => void {
  if (typeof EventSource === 'undefined') return () => {};
  const es = new EventSource(`${topic(id)}/sse`);
  es.onmessage = (e) => {
    const s = parse(e.data);
    if (s) onSteps(s);
  };
  return () => es.close();
}
