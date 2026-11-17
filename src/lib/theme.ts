import { useColorScheme } from 'react-native';

// Minimal palette: near-white canvas, ink text, one accent used sparingly.
const light = {
  bg: '#FAFAF9',
  card: '#FFFFFF',
  fill: '#F2F1EF', // inputs, segmented track, ring track
  text: '#111111',
  sub: '#8A8A8E',
  line: '#ECEBE9',
  primary: '#FF5C7A',
  primarySoft: '#FFEDF0',
  onPrimary: '#FFFFFF',
  good: '#1FA971',
  goodSoft: '#E6F6EF',
  warn: '#E8803A',
  warnSoft: '#FDF0E6',
  ringTrack: '#EFEEEC',
};

const dark: typeof light = {
  bg: '#0E0E0F',
  card: '#1A1A1C',
  fill: '#232326',
  text: '#F4F4F5',
  sub: '#8E8E93',
  line: '#26262A',
  primary: '#FF6F8A',
  primarySoft: '#3A1E25',
  onPrimary: '#FFFFFF',
  good: '#34C88A',
  goodSoft: '#12291F',
  warn: '#F2994A',
  warnSoft: '#33231524',
  ringTrack: '#232326',
};

export type Palette = typeof light;

export function useTheme(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export const font = 'IBM Plex Sans Thai, system-ui, -apple-system, sans-serif';
export const radius = 22;
export const MAX_W = 480;
