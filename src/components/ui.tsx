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

import { font, MAX_W, radius, useTheme } from '@/lib/theme';

const fontFamily = Platform.OS === 'web' ? font : undefined;

export function Screen({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const c = useTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: c.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>{children}</View>
      </ScrollView>
      {footer ? <View style={[styles.footer, { backgroundColor: c.bg }]}>{footer}</View> : null}
    </SafeAreaView>
  );
}

type TextKind = 'hero' | 'display' | 'title' | 'body' | 'sub' | 'caption';

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
  return (
    <Text
      style={[
        { fontFamily, color: color ?? (muted ? c.sub : c.text) },
        textStyles[kind],
        weight ? { fontWeight: weight } : null,
        center && { textAlign: 'center' },
        style,
      ]}>
      {children}
    </Text>
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
  kind?: 'primary' | 'quiet' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  const bg = kind === 'primary' ? c.text : kind === 'quiet' ? c.fill : 'transparent';
  const fg = kind === 'primary' ? c.bg : kind === 'danger' ? c.warn : kind === 'ghost' ? c.sub : c.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.35 : pressed ? 0.75 : 1 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={[styles.btnText, { color: fg, fontFamily }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

/** Round icon button, e.g. the camera button. */
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
          backgroundColor: kind === 'primary' ? c.primary : c.fill,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
        kind === 'primary' && styles.shadow,
      ]}>
      {loading ? <ActivityIndicator color={kind === 'primary' ? c.onPrimary : c.text} /> : children}
    </Pressable>
  );
}

/** iOS-style segmented control. */
export function Segmented<V extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: V; label: string }[];
  value: V;
  onChange: (v: V) => void;
}) {
  const c = useTheme();
  return (
    <View style={[styles.seg, { backgroundColor: c.fill }]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.segItem, on && [{ backgroundColor: c.card }, styles.segShadow]]}>
            <Text style={[styles.segText, { color: on ? c.text : c.sub, fontFamily }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Grouped list container with an optional small heading. */
export function Group({ title, children }: { title?: string; children: ReactNode }) {
  const c = useTheme();
  return (
    <View style={{ marginBottom: 24 }}>
      {title ? (
        <T kind="caption" style={{ marginLeft: 4, marginBottom: 8 }}>
          {title}
        </T>
      ) : null}
      <View style={[styles.group, { backgroundColor: c.card }]}>{children}</View>
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
    <View style={[styles.rowItem, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line }]}>
      <View style={{ flex: 1 }}>
        <T kind="body">{label}</T>
        {sub ? <T kind="caption">{sub}</T> : null}
      </View>
      {value != null ? <T kind="body" color={c.sub}>{value}</T> : null}
      {right}
      {onPress && !right ? <T kind="body" color={c.sub}> ›</T> : null}
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

/** Compact − value + control that sits inside a Row. */
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
      style={({ pressed }) => [styles.mini, { backgroundColor: c.fill, opacity: pressed ? 0.6 : 1 }]}>
      <Text style={[styles.miniText, { color: c.text }]}>{sign}</Text>
    </Pressable>
  );
  return (
    <View style={styles.stepper}>
      <B sign="−" delta={-step} />
      <T kind="body" weight="600" style={{ minWidth: 76, textAlign: 'center' }}>
        {value} <T kind="sub">{unit}</T>
      </T>
      <B sign="+" delta={step} />
    </View>
  );
}

export function Gap({ h = 12 }: { h?: number }) {
  return <View style={{ height: h }} />;
}

const textStyles = StyleSheet.create({
  hero: { fontSize: 64, fontWeight: '700', letterSpacing: -2.5, lineHeight: 70 },
  display: { fontSize: 32, fontWeight: '700', letterSpacing: -0.8, lineHeight: 40 },
  title: { fontSize: 19, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 24 },
  sub: { fontSize: 15, lineHeight: 22 },
  caption: { fontSize: 13, lineHeight: 18 },
});

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 48 },
  inner: { width: '100%', maxWidth: MAX_W, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 16, flex: 1 },
  footer: { width: '100%', maxWidth: MAX_W, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  btn: { minHeight: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22 },
  btnText: { fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shadow: {
    shadowColor: '#FF5C7A',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  seg: { flexDirection: 'row', borderRadius: 14, padding: 3 },
  segItem: { flex: 1, paddingVertical: 9, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  segShadow: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  segText: { fontSize: 14, fontWeight: '600' },
  group: { borderRadius: radius, paddingHorizontal: 16 },
  rowItem: { flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingVertical: 10, gap: 10 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mini: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  miniText: { fontSize: 20, lineHeight: 22, fontWeight: '500' },
});
