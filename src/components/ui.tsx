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

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const c = useTheme();
  const inner = <View style={styles.inner}>{children}</View>;
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: c.bg }]} edges={['top']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

type TextKind = 'display' | 'title' | 'body' | 'sub' | 'label' | 'big';

export function T({
  children,
  kind = 'body',
  style,
  color,
  center,
}: {
  children: ReactNode;
  kind?: TextKind;
  style?: StyleProp<TextStyle>;
  color?: string;
  center?: boolean;
}) {
  const c = useTheme();
  return (
    <Text
      style={[
        { fontFamily, color: color ?? (kind === 'sub' || kind === 'label' ? c.sub : c.text) },
        textStyles[kind],
        center && { textAlign: 'center' },
        style,
      ]}>
      {children}
    </Text>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  return <View style={[styles.card, { backgroundColor: c.card, borderColor: c.line }, style]}>{children}</View>;
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
  kind?: 'primary' | 'soft' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  const bg =
    kind === 'primary' ? c.primary : kind === 'soft' ? c.primarySoft : kind === 'danger' ? c.warnSoft : 'transparent';
  const fg = kind === 'primary' ? c.onPrimary : kind === 'danger' ? c.warn : c.primary;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
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

export function Chip({
  label,
  selected,
  onPress,
  hint,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  hint?: string;
}) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? c.primarySoft : c.card,
          borderColor: selected ? c.primary : c.line,
        },
      ]}>
      <Text style={[styles.chipText, { color: selected ? c.primary : c.text, fontFamily }]}>{label}</Text>
      {hint ? <Text style={[styles.chipHint, { color: c.sub, fontFamily }]}>{hint}</Text> : null}
    </Pressable>
  );
}

/** Number picker with − / + buttons; long values without typing. */
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
  const Round = ({ sign, delta }: { sign: string; delta: number }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${sign}`}
      onPress={() => set(value + delta)}
      style={({ pressed }) => [styles.round, { backgroundColor: c.primarySoft, opacity: pressed ? 0.7 : 1 }]}>
      <Text style={[styles.roundText, { color: c.primary }]}>{sign}</Text>
    </Pressable>
  );
  return (
    <View style={[styles.stepper, { borderColor: c.line, backgroundColor: c.card }]}>
      <T kind="label">{label}</T>
      <View style={styles.stepperRow}>
        <Round sign="−" delta={-step} />
        <View style={{ alignItems: 'center', minWidth: 110 }}>
          <T kind="title">
            {value} <T kind="sub">{unit}</T>
          </T>
        </View>
        <Round sign="+" delta={step} />
      </View>
    </View>
  );
}

export function Gap({ h = 12 }: { h?: number }) {
  return <View style={{ height: h }} />;
}

const textStyles = StyleSheet.create({
  display: { fontSize: 30, fontWeight: '700', letterSpacing: -0.5 },
  big: { fontSize: 44, fontWeight: '700', letterSpacing: -1 },
  title: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24 },
  sub: { fontSize: 14, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
});

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  inner: { width: '100%', maxWidth: MAX_W, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 12, flex: 1 },
  card: { borderRadius: radius, padding: 18, borderWidth: StyleSheet.hairlineWidth },
  btn: { minHeight: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  btnText: { fontSize: 17, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chip: { borderRadius: 16, borderWidth: 1.5, paddingVertical: 12, paddingHorizontal: 16, flexGrow: 1, flexBasis: 0 },
  chipText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  chipHint: { fontSize: 12, textAlign: 'center', marginTop: 2 },
  stepper: { borderRadius: radius, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 10 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  round: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  roundText: { fontSize: 28, fontWeight: '500', lineHeight: 32 },
});
