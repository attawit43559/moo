import { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { useTheme } from '@/lib/theme';

export function Ring({
  progress,
  size = 240,
  stroke = 18,
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
          strokeDashoffset={circ * (1 - p)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

export type PigMood = 'happy' | 'calm' | 'proud';

/** Moo the pig. Simple geometric mascot drawn in SVG. */
export function Pig({ size = 96, mood = 'happy' }: { size?: number; mood?: PigMood }) {
  const body = '#F7A8B3';
  const dark = '#E07888';
  const ink = '#3A2A2D';
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* ears */}
      <Path d="M22 30 L30 10 L42 26 Z" fill={dark} />
      <Path d="M78 30 L70 10 L58 26 Z" fill={dark} />
      {/* head */}
      <Circle cx="50" cy="52" r="36" fill={body} />
      {/* cheeks */}
      <Ellipse cx="26" cy="62" rx="6" ry="4" fill={dark} opacity={0.35} />
      <Ellipse cx="74" cy="62" rx="6" ry="4" fill={dark} opacity={0.35} />
      {/* eyes */}
      {mood === 'calm' ? (
        <>
          <Path d="M32 46 Q37 50 42 46" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
          <Path d="M58 46 Q63 50 68 46" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : mood === 'proud' ? (
        <>
          <Path d="M32 48 Q37 42 42 48" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
          <Path d="M58 48 Q63 42 68 48" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <Circle cx="37" cy="46" r="4" fill={ink} />
          <Circle cx="63" cy="46" r="4" fill={ink} />
        </>
      )}
      {/* snout */}
      <Ellipse cx="50" cy="64" rx="15" ry="11" fill={dark} />
      <Ellipse cx="45" cy="64" rx="3" ry="4.5" fill={ink} opacity={0.8} />
      <Ellipse cx="55" cy="64" rx="3" ry="4.5" fill={ink} opacity={0.8} />
    </Svg>
  );
}
