import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextStyle, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Bar, Pig } from '@/components/art';
import { Btn, Gap, Screen, T } from '@/components/ui';
import { kcalToSteps, MAX_STEP_GOAL, strideM, summarize, todayKey } from '@/lib/energy';
import { fmt } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { BORDER, monoFont, useTheme } from '@/lib/theme';

const mono = Platform.OS === 'web' ? monoFont : Platform.OS === 'ios' ? 'Menlo' : 'monospace';

function Mono({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  const c = useTheme();
  return <Text style={[{ fontFamily: mono, color: c.ink, fontSize: 15 }, style]}>{children}</Text>;
}

/** Torn-paper bottom edge of the receipt. */
function Zigzag({ width, color, ink }: { width: number; color: string; ink: string }) {
  const tooth = 16;
  const h = 10;
  const n = Math.max(1, Math.round(width / tooth));
  const w = width / n;
  let d = `M0 0 L0 ${h}`;
  for (let i = 0; i < n; i++) d += ` L${i * w + w / 2} 0 L${(i + 1) * w} ${h}`;
  d += ` L${width} 0 Z`;
  let edge = `M0 0 L0 ${h}`;
  for (let i = 0; i < n; i++) edge += ` L${i * w + w / 2} 0 L${(i + 1) * w} ${h}`;
  edge += ` L${width} 0`;
  return (
    <Svg width={width} height={h + 2} style={{ marginTop: -1 }}>
      <Path d={d} fill={color} />
    </Svg>
  );
}

export default function Bill() {
  const { t, state } = useStore();
  const c = useTheme();
  const [w, setW] = useState(0);
  if (!state.profile) return null;
  const profile = state.profile;
  const lang = state.lang;
  const today = todayKey();
  const meals = state.meals.filter((m) => m.date === today);
  const intake = meals.reduce((a, m) => a + m.kcal, 0);
  const steps = state.steps[today]?.count ?? 0;
  const now = new Date();
  const s = summarize(profile, intake, steps, now);

  const mealSteps = meals.map((m) => kcalToSteps(profile, m.kcal));
  const eatenSteps = mealSteps.reduce((a, b) => a + b, 0);
  const bodySteps = Math.min(eatenSteps, kcalToSteps(profile, s.budgetSoFar));
  const subtotal = eatenSteps - bodySteps;
  const capCut = Math.max(0, subtotal - MAX_STEP_GOAL);
  const total = s.stepGoal;
  const due = s.stepsLeft;
  const progress = total ? steps / total : 1;
  const stamp = progress >= 1 ? t('stampDone') : progress >= 0.8 ? t('stampClose') : null;
  const net = s.netNow;
  const km = ((due * strideM(profile)) / 1000).toFixed(1);
  const dayNo = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const time = (iso: string) => new Date(iso).toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  const Item = ({ label, hint, value }: { label: string; hint?: string; value: string }) => (
    <View style={styles.item}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <T kind="body">{label}</T>
        {hint ? <T kind="caption">{hint}</T> : null}
      </View>
      <Mono>{value}</Mono>
    </View>
  );
  const Dash = () => <View style={[styles.dash, { borderColor: '#C9CCD1' }]} />;

  return (
    <Screen footer={<Btn kind="quiet" label={t('close')} onPress={close} />}>
      <View style={styles.top}>
        <T kind="display" style={{ fontSize: 36, letterSpacing: -1.5 }}>
          moo.
        </T>
        <View style={{ alignItems: 'flex-end' }}>
          <Mono style={{ fontSize: 12, color: c.sub }}>{now.toLocaleDateString('en-GB').replace(/\//g, '.')}</Mono>
          <Mono style={{ fontSize: 12, color: c.sub }}>{t('billNo', { n: String(dayNo).padStart(3, '0') })}</Mono>
        </View>
      </View>

      <Gap h={40} />
      <View
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
        style={styles.receiptWrap}>
        <View style={[styles.receipt, { backgroundColor: c.card }]}>
          <View style={styles.pig} pointerEvents="none">
            <Pig size={70} mood={progress >= 1 ? 'proud' : 'happy'} />
          </View>
          <Mono style={{ textAlign: 'center', letterSpacing: 4, fontSize: 13, fontWeight: '600', color: c.sub }}>{t('billHead')}</Mono>
          <Dash />
          {meals.length === 0 ? <Item label={t('billEmpty')} value="0" /> : null}
          {meals.map((m, i) => (
            <Item
              key={m.id}
              label={lang === 'th' ? m.nameTh : m.nameEn}
              hint={`${time(m.time)} · ${fmt(m.kcal, lang)} kcal`}
              value={fmt(mealSteps[i], lang)}
            />
          ))}
          {bodySteps > 0 ? (
            <Item
              label={t('billBody')}
              hint={t('billBodyHint')}
              value={`−${fmt(bodySteps, lang)}`}
            />
          ) : null}
          {capCut > 0 ? <Item label={t('billCap')} hint={t('billCapHint', { n: fmt(MAX_STEP_GOAL, lang) })} value={`−${fmt(capCut, lang)}`} /> : null}
          <Dash />
          <View style={styles.total}>
            <T kind="title">{t('billTotal')}</T>
            <View style={[styles.hl, { backgroundColor: c.butter }]}>
              <Mono style={{ fontSize: 38, fontWeight: '600', letterSpacing: -2 }}>{fmt(total, lang)}</Mono>
            </View>
          </View>
          <Gap h={10} />
          <Bar progress={progress} height={8} color={progress >= 1 ? c.good : c.ink} />
          <Gap h={8} />
          <View style={styles.paid}>
            <Mono style={{ color: c.sub }}>{t('billPaid')}</Mono>
            <Mono style={{ color: c.sub }}>{fmt(steps, lang)}</Mono>
          </View>
          <View style={styles.paid}>
            <Mono style={{ color: due ? c.warn : c.good, fontWeight: '700' }}>{t('billDue')}</Mono>
            <Mono style={{ color: due ? c.warn : c.good, fontWeight: '700' }}>{fmt(due, lang)}</Mono>
          </View>
          <Dash />
          <View style={styles.paid}>
            <Mono style={{ color: c.sub, fontSize: 13 }}>{t('billNet')}</Mono>
            <Mono style={{ color: c.sub, fontSize: 13 }}>
              {(net > 0 ? '+' : net < 0 ? '−' : '') + fmt(Math.abs(net), lang)} kcal
            </Mono>
          </View>
          {stamp ? (
            <View style={[styles.stamp, { borderColor: c.warn }]} pointerEvents="none">
              <Mono style={{ color: c.warn, fontWeight: '700', fontSize: 16, letterSpacing: 1 }}>{stamp}</Mono>
            </View>
          ) : null}
        </View>
        {w > 0 ? <Zigzag width={w} color={c.card} ink={c.ink} /> : null}
      </View>

      <Gap h={26} />
      <T kind="body" center>
        {due > 0 ? t('billLeftHint', { n: fmt(due, lang), km }) : t('billAllPaid')}
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptWrap: {},
  receipt: {
    borderWidth: BORDER,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
  },
  pig: { position: 'absolute', left: -18, top: -38, transform: [{ rotate: '-6deg' }] },
  item: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6 },
  dash: { borderTopWidth: 1.5, borderStyle: 'dashed', marginVertical: 12 },
  total: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hl: { paddingHorizontal: 6, borderRadius: 4 },
  paid: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  stamp: {
    position: 'absolute',
    right: 110,
    bottom: 64,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    opacity: 0.85,
    transform: [{ rotate: '-14deg' }],
  },
});
