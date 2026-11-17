import { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { useTheme } from '@/lib/theme';

export function Ring({
  progress,
  size = 260,
  stroke = 12,
  children,
}: {
  progress: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const c = useTheme();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  const color = p >= 1 ? c.good : c.primary;
  const shown = p > 0 ? Math.max(p, 0.012) : 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.ringTrack} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={circ * (1 - shown)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

export type PigMood = 'happy' | 'calm' | 'proud';

/** Moo the pig: a single-weight line drawing over soft pastel blobs. */
export function Pig({ size = 96, mood = 'happy' }: { size?: number; mood?: PigMood }) {
  const ink = '#111111';
  const w = 2.6;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="46" cy="60" r="32" fill="#FFC9D6" />
      <Circle cx="86" cy="22" r="9" fill={mood === 'proud' ? '#FFF3A6' : '#CBEFFC'} />
      <Path d="M27 36 C24 24 28 14 33 12 C38 16 42 22 43 27" fill="none" stroke={ink} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M73 36 C76 24 72 14 67 12 C62 16 58 22 57 27" fill="none" stroke={ink} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M50 22 C72 22 84 38 84 56 C84 74 70 86 50 86 C30 86 16 74 16 56 C16 38 28 22 50 22 Z" fill="none" stroke={ink} strokeWidth={w} />
      {mood === 'calm' ? (
        <>
          <Path d="M34 49 Q38 53 42 49" stroke={ink} strokeWidth={w} fill="none" strokeLinecap="round" />
          <Path d="M58 49 Q62 53 66 49" stroke={ink} strokeWidth={w} fill="none" strokeLinecap="round" />
        </>
      ) : mood === 'proud' ? (
        <>
          <Path d="M34 51 Q38 45 42 51" stroke={ink} strokeWidth={w} fill="none" strokeLinecap="round" />
          <Path d="M58 51 Q62 45 66 51" stroke={ink} strokeWidth={w} fill="none" strokeLinecap="round" />
          <Path d="M88 14 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill={ink} />
        </>
      ) : (
        <>
          <Circle cx="38" cy="49" r="3" fill={ink} />
          <Circle cx="62" cy="49" r="3" fill={ink} />
        </>
      )}
      <Ellipse cx="50" cy="65" rx="12" ry="8.5" fill="none" stroke={ink} strokeWidth={w} />
      <Circle cx="46" cy="65" r="1.8" fill={ink} />
      <Circle cx="54" cy="65" r="1.8" fill={ink} />
      <Path d="M44 77 Q50 80 56 77" stroke={ink} strokeWidth={w} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/** Thin progress bar. */
export function Bar({ progress, color, height = 8, track }: { progress: number; color?: string; height?: number; track?: string }) {
  const c = useTheme();
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: track ?? 'rgba(17,17,17,0.10)', overflow: 'hidden' }}>
      {p > 0 ? <View style={{ width: `${Math.max(p, 0.03) * 100}%`, height: '100%', borderRadius: height / 2, backgroundColor: color ?? c.ink }} /> : null}
    </View>
  );
}
