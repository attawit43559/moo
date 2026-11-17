import { Linking, Platform } from 'react-native';

/** Name of the iPhone Shortcut that reads today's steps from Apple Health and opens Moo with ?n=STEPS. */
export const SHORTCUT_NAME = 'Moo';
/** Signed Shortcut file served next to the app (public/Moo.shortcut). Opening it on iPhone offers "Add Shortcut". */
export function shortcutInstallUrl(): string {
  if (Platform.OS !== 'web') return 'https://attawit43559.github.io/moo/Moo.shortcut';
  return stepsReturnUrl().replace(/\?n=$/, 'Moo.shortcut');
}

export const isIOSWeb = () =>
  Platform.OS === 'web' && typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);

/** Where the Shortcut sends steps: the app root with ?n=. */
export function stepsReturnUrl(): string {
  if (Platform.OS !== 'web') return 'moo://?n=';
  const { origin, pathname } = window.location;
  const base = pathname.replace(/\/(steps|history|settings|bill)\/?$/, '').replace(/\/$/, '');
  return `${origin}${base}/?n=`;
}

/** One tap refresh: run the Shortcut, which comes back to Moo with fresh steps. */
export function runShortcut() {
  Linking.openURL(`shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME)}`);
}

export function parseSteps(v: unknown): number | null {
  if (v == null) return null;
  const n = Math.round(Number(String(Array.isArray(v) ? v[0] : v).replace(/[^\d.]/g, '')));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Drop ?n= from the address bar so a reload doesn't re-apply old steps. */
export function clearStepsParam() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const u = new URL(window.location.href);
    u.searchParams.delete('n');
    window.history.replaceState(null, '', u.toString());
  }
}
