import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BORDER, displayFont, font, MAX_W, radius, shadow, useTheme } from '@/lib/theme';

const web = Platform.OS === 'web';
const bodyFamily = web ? font : undefined;
const displayFamily = web ? displayFont : undefined;

export function Screen({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const c = useTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: c.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>{children}</View>
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

type TextKind = 'hero' | 'display' | 'title' | 'body' | 'sub' | 'caption' | 'num';

export function T({
  children,
  kind = 'body',
  style,
  color,
  center,
  weight,
}: {
  children: ReactNode;
  kind?: TextKind;
  style?: StyleProp<TextStyle>;
  color?: string;
  center?: boolean;
  weight?: TextStyle['fontWeight'];
}) {
  const c = useTheme();
  const muted = kind === 'sub' || kind === 'caption';
  const display = kind === 'hero' || kind === 'display' || kind === 'num';
  return (
    <Text
      style={[
        { fontFamily: display ? displayFamily : bodyFamily, color: color ?? (muted ? c.sub : c.text) },
        textStyles[kind],
        weight ? { fontWeight: weight } : null,
        center && { textAlign: 'center' },
        style,
      ]}>
      {children}
    </Text>
  );
}

/** Borderless rounded card on a soft grey or pastel fill. */
export function Sticker({
  children,
  color,
  style,
  flat,
  tilt,
}: {
  children: ReactNode;
  color?: string;
  style?: StyleProp<ViewStyle>;
  flat?: boolean;
  tilt?: number;
}) {
  const c = useTheme();
  return (
    <View
      style={[
        styles.sticker,
        { backgroundColor: color ?? c.card },
        !flat && shadow(4),
        tilt ? { transform: [{ rotate: `${tilt}deg` }] } : null,
        style,
      ]}>
      {children}
    </View>
  );
}

export function Btn({
  label,
  onPress,
  kind = 'primary',
  loading,
  disabled,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'quiet' | 'ghost' | 'danger' | 'lime';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  const bg = { primary: c.primary, lime: c.butter, quiet: c.card, danger: c.warnSoft, ghost: 'transparent' }[kind];
  const fg = kind === 'primary' ? c.onPrimary : kind === 'ghost' ? c.sub : kind === 'danger' ? c.warn : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.45 : 1 },
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.85 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={[styles.btnText, { color: fg, fontFamily: bodyFamily }]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function RoundBtn({
  onPress,
  children,
  size = 64,
  kind = 'primary',
  label,
  loading,
}: {
  onPress: () => void;
  children: ReactNode;
  size?: number;
  kind?: 'primary' | 'quiet';
  label: string;
  loading?: boolean;
}) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: kind === 'primary' ? c.primary : c.card,
        },
        pressed && { transform: [{ scale: 0.96 }] },
      ]}>
      {loading ? <ActivityIndicator color={kind === 'primary' ? c.onPrimary : c.ink} /> : children}
    </Pressable>
  );
}

/** Row of sticker chips; the chosen one fills with colour. */
export function Segmented<V extends string | number>({
  options,
  value,
  onChange,
  color,
}: {
  options: { value: V; label: string }[];
  value: V;
  onChange: (v: V) => void;
  color?: string;
}) {
  const c = useTheme();
  return (
    <View style={[styles.seg, { backgroundColor: c.card }]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[
              styles.segItem,
              { backgroundColor: on ? color ?? c.bg : 'transparent' },
            ]}>
            <Text style={[styles.segText, { color: c.ink, fontFamily: bodyFamily, fontWeight: on ? '600' : '400' }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Group({ title, children, color }: { title?: string; children: ReactNode; color?: string }) {
  return (
    <View style={{ marginBottom: 24 }}>
      {title ? (
        <T kind="title" style={{ marginBottom: 10 }}>
          {title}
        </T>
      ) : null}
      <Sticker color={color} style={{ paddingVertical: 4, paddingHorizontal: 16 }}>
        {children}
      </Sticker>
    </View>
  );
}

export function Row({
  label,
  value,
  right,
  onPress,
  last,
  sub,
}: {
  label: string;
  value?: string;
  right?: ReactNode;
  onPress?: () => void;
  last?: boolean;
  sub?: string;
}) {
  const c = useTheme();
  const body = (
    <View style={[styles.rowItem, !last && { borderBottomWidth: 1, borderBottomColor: c.line }]}>
      <View style={{ flex: 1 }}>
        <T kind="body">{label}</T>
        {sub ? <T kind="caption">{sub}</T> : null}
      </View>
      {value != null ? <T kind="body" color={c.sub}>{value}</T> : null}
      {right}
      {onPress && !right ? <T kind="title" color={c.sub}>›</T> : null}
    </View>
  );
  return onPress ? (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      {body}
    </Pressable>
  ) : (
    body
  );
}

export function Stepper({
  label,
  value,
  unit,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const c = useTheme();
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v * 10) / 10)));
  const B = ({ sign, delta }: { sign: string; delta: number }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${sign}`}
      onPress={() => set(value + delta)}
      hitSlop={6}
      style={({ pressed }) => [styles.mini, { backgroundColor: pressed ? c.line : c.bg }]}>
      <Text style={[styles.miniText, { color: c.ink }]}>{sign}</Text>
    </Pressable>
  );
  return (
    <View style={styles.stepper}>
      <B sign="−" delta={-step} />
      <T kind="num" style={{ minWidth: 84, textAlign: 'center', fontSize: 20 }}>
        {value}
        <T kind="caption"> {unit}</T>
      </T>
      <B sign="+" delta={step} />
    </View>
  );
}

/** Small rounded label, e.g. "14,885 ก้าว". */
export function Tag({ label, color, style }: { label: string; color?: string; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  return (
    <View style={[styles.tag, { backgroundColor: color ?? c.bg }, style]}>
      <Text style={{ fontFamily: bodyFamily, fontSize: 12, fontWeight: '600', color: c.ink }}>{label}</Text>
    </View>
  );
}

export function Gap({ h = 12 }: { h?: number }) {
  return <View style={{ height: h }} />;
}

const textStyles = StyleSheet.create({
  hero: { fontSize: 72, fontWeight: '600', letterSpacing: -3, lineHeight: 80 },
  display: { fontSize: 30, fontWeight: '600', letterSpacing: -0.8, lineHeight: 40 },
  num: { fontSize: 24, fontWeight: '600', letterSpacing: -0.6 },
  title: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24 },
  sub: { fontSize: 15, lineHeight: 22 },
  caption: { fontSize: 13, lineHeight: 18 },
});

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 48 },
  inner: { width: '100%', maxWidth: MAX_W, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 14, flex: 1 },
  footer: { width: '100%', maxWidth: MAX_W, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 10, paddingBottom: 22 },
  sticker: { borderRadius: radius, borderWidth: BORDER, padding: 16 },
  btn: { minHeight: 58, borderRadius: 30, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  btnText: { fontSize: 17, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  seg: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 26 },
  segItem: { flex: 1, minHeight: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  segText: { fontSize: 15 },
  rowItem: { flexDirection: 'row', alignItems: 'center', minHeight: 58, paddingVertical: 10, gap: 10 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mini: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  miniText: { fontSize: 20, lineHeight: 22, fontWeight: '600' },
  tag: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
});
