// "Sticker Pop" design system: cream paper, ink outlines, candy colours, soft shadows.
// One palette on purpose: the look depends on the cream + ink contrast.

const palette = {
  bg: '#FFF4E2', // cream paper
  card: '#FFFFFF',
  fill: '#FFF9F0',
  ink: '#1B1B1B',
  text: '#1B1B1B',
  sub: '#6E655B',
  line: '#1B1B1B',
  pink: '#FF8FB1',
  pinkLight: '#FFB3C7',
  lime: '#C6F36B',
  sky: '#8FD3FF',
  butter: '#FFD84D',
  primary: '#FF8FB1',
  primarySoft: '#FFE0EA',
  onPrimary: '#1B1B1B',
  good: '#1E9E5A',
  goodSoft: '#C6F36B',
  warn: '#E5484D',
  warnSoft: '#FFD9D9',
  ringTrack: '#FFF4E2',
};

export type Palette = typeof palette;

export function useTheme(): Palette {
  return palette;
}

/** Thai-first clean font for text. */
export const font = 'Anuphan, system-ui, sans-serif';
/** Chunky display font for numbers and Latin headings; Thai glyphs fall back to Anuphan. */
export const displayFont = '"Bricolage Grotesque", Anuphan, system-ui, sans-serif';
export const monoFont = '"IBM Plex Mono", Anuphan, ui-monospace, monospace';
export const radius = 24;
export const MAX_W = 480;
export const BORDER = 1.5;
export const shadow = (n = 4) => ({ boxShadow: `0 ${n + 2}px ${n * 4}px rgba(27, 27, 27, 0.10)` });
