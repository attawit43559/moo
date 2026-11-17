import { useColorScheme } from 'react-native';

const light = {
  bg: '#FBF8F5',
  card: '#FFFFFF',
  text: '#1F1A17',
  sub: '#7A716B',
  line: '#EFE8E2',
  primary: '#F47C8A', // piggy pink
  primarySoft: '#FDE6E9',
  onPrimary: '#FFFFFF',
  good: '#2FA37A',
  goodSoft: '#E1F4EC',
  warn: '#E58A2B',
  warnSoft: '#FCEEDD',
  ringTrack: '#F3ECE6',
};

const dark: typeof light = {
  bg: '#141211',
  card: '#1F1C1A',
  text: '#F5EFEA',
  sub: '#A69C95',
  line: '#2D2926',
  primary: '#F7909C',
  primarySoft: '#3A2327',
  onPrimary: '#1B0F11',
  good: '#4CC497',
  goodSoft: '#173328',
  warn: '#F0A350',
  warnSoft: '#3A2A17',
  ringTrack: '#2B2724',
};

export type Palette = typeof light;

export function useTheme(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export const font = 'IBM Plex Sans Thai, system-ui, -apple-system, sans-serif';
export const radius = 20;
export const MAX_W = 520;
