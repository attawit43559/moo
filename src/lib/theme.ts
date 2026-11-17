// "Soft Pastel" design system: white page, borderless pastel cards, black pills for actions.

const palette = {
  bg: '#FFFFFF',
  card: '#F3F4F6', // soft grey surface
  fill: '#F3F4F6',
  ink: '#111111',
  text: '#111111',
  sub: '#6B6F76',
  line: '#E8E9EC',
  pink: '#FFC9D6',
  pinkLight: '#FFE3EA',
  lime: '#FFE2CC', // peach (hero)
  sky: '#CBEFFC',
  butter: '#FFF3A6',
  slate: '#D7E2EB',
  mint: '#D6F4E2',
  primary: '#D7E2EB',
  primarySoft: '#FFE3EA',
  onPrimary: '#111111',
  good: '#1A8F52',
  goodSoft: '#D6F4E2',
  warn: '#D9363E',
  warnSoft: '#FFE1E1',
  ringTrack: '#E8E9EC',
};

export type Palette = typeof palette;

export function useTheme(): Palette {
  return palette;
}

/** Thai-first clean font for text. */
export const font = 'Anuphan, system-ui, sans-serif';
/** Geometric display font for numbers and Latin headings; Thai glyphs fall back to Anuphan. */
export const displayFont = 'Lexend, Anuphan, system-ui, sans-serif';
export const monoFont = '"IBM Plex Mono", Anuphan, ui-monospace, monospace';
export const radius = 28;
export const MAX_W = 480;
export const BORDER = 0;
export const shadow = (_n = 4) => ({});
