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

/** Moo the pig, drawn as an outlined sticker. */
export function Pig({ size = 96, mood = 'happy' }: { size?: number; mood?: PigMood }) {
  const body = '#FFB3C7';
  const dark = '#FF8FB1';
  const ink = '#1B1B1B';
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d="M22 30 L30 10 L42 26 Z" fill={dark} stroke={ink} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M78 30 L70 10 L58 26 Z" fill={dark} stroke={ink} strokeWidth={4} strokeLinejoin="round" />
      <Circle cx="50" cy="54" r="34" fill={body} stroke={ink} strokeWidth={4} />
      <Ellipse cx="27" cy="62" rx="5" ry="3.2" fill={dark} />
      <Ellipse cx="73" cy="62" rx="5" ry="3.2" fill={dark} />
      {mood === 'calm' ? (
        <>
          <Path d="M33 48 Q38 52 43 48" stroke={ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <Path d="M57 48 Q62 52 67 48" stroke={ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </>
      ) : mood === 'proud' ? (
        <>
          <Path d="M33 50 Q38 43 43 50" stroke={ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <Path d="M57 50 Q62 43 67 50" stroke={ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <Circle cx="38" cy="48" r="4" fill={ink} />
          <Circle cx="62" cy="48" r="4" fill={ink} />
        </>
      )}
      <Ellipse cx="50" cy="65" rx="13" ry="9" fill={dark} stroke={ink} strokeWidth={3.5} />
      <Circle cx="46" cy="65" r="2.4" fill={ink} />
      <Circle cx="54" cy="65" r="2.4" fill={ink} />
    </Svg>
  );
}

/** Outlined progress bar, as on the home hero card. */
export function Bar({ progress, color, height = 18 }: { progress: number; color?: string; height?: number }) {
  const c = useTheme();
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ height, borderWidth: 2.5, borderColor: c.ink, borderRadius: 12, backgroundColor: c.bg, overflow: 'hidden' }}>
      {p > 0 ? (
        <View
          style={{
            width: `${Math.max(p, 0.04) * 100}%`,
            height: '100%',
            backgroundColor: color ?? c.pink,
            borderRightWidth: p < 1 ? 2.5 : 0,
            borderColor: c.ink,
          }}
        />
      ) : null}
    </View>
  );
}
