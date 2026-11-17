import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Pig, PigMood, Ring } from '@/components/art';
import { Gap, RoundBtn, Screen, T } from '@/components/ui';
import { kcalToSteps, summarize, todayKey } from '@/lib/energy';
import { fmt } from '@/lib/i18n';
import { pickImage } from '@/lib/image';
import { setPending } from '@/lib/pending';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

function Icon({ d, color, size = 26 }: { d: string; color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d={d} />
    </Svg>
  );
}
const CAMERA = 'M4 8.5h2.6l1.6-2.5h7.6l1.6 2.5H20v10.5H4zM12 16.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z';
const GALLERY = 'M4 5h16v14H4zM4 15l4.5-4.5 4 4 2.5-2.5L20 17M15.5 9.5h.01';
const REFRESH = 'M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6';

function timeLabel(iso: string, lang: 'th' | 'en') {
  return new Date(iso).toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function Today() {
  const { t, state, removeMeal } = useStore();
  const c = useTheme();
  const [busy, setBusy] = useState<'camera' | 'library' | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const profile = state.profile!;
  const lang = state.lang;
  const today = todayKey();
  const meals = state.meals.filter((m) => m.date === today);
  const intake = meals.reduce((a, m) => a + m.kcal, 0);
  const stepEntry = state.steps[today];
  const steps = stepEntry?.count ?? 0;
  const now = new Date();
  const s = summarize(profile, intake, steps, now);
  const progress = s.stepGoal ? steps / s.stepGoal : 0;
  const left = Math.max(0, s.stepGoal - steps);
  const mood: PigMood = progress >= 1 ? 'proud' : progress > 0.5 ? 'happy' : 'calm';
  const burned = s.baseSoFar + s.walkKcal;
  const net = intake - burned;

  const snap = async (source: 'camera' | 'library') => {
    if (!state.apiKey) return router.push('/connect-ai');
    setBusy(source);
    try {
      const p = await pickImage(source);
      if (p) {
        setPending(p);
        router.push('/food');
      }
    } finally {
      setBusy(null);
    }
  };

  const Stat = ({ label, value, color }: { label: string; value: string; color?: string }) => (
    <View style={styles.stat}>
      <T kind="title" color={color}>
        {value}
      </T>
      <T kind="caption">{label}</T>
    </View>
  );

  return (
    <Screen
      footer={
        <View style={styles.dock}>
          <View style={{ width: 52 }} />
          <RoundBtn size={72} label={t('snapMeal')} loading={busy === 'camera'} onPress={() => snap('camera')}>
            <Icon d={CAMERA} color={c.onPrimary} size={30} />
          </RoundBtn>
          <RoundBtn size={52} kind="quiet" label={t('pickPhoto')} loading={busy === 'library'} onPress={() => snap('library')}>
            <Icon d={GALLERY} color={c.text} size={22} />
          </RoundBtn>
        </View>
      }>
      <View style={styles.header}>
        <T kind="caption">
          {now.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
        </T>
        <Pig size={40} mood={mood} />
      </View>

      <Gap h={12} />
      <View style={{ alignItems: 'center' }}>
        <Ring progress={progress} size={236}>
          <T kind="hero">{fmt(steps, lang)}</T>
          <T kind="caption">{t('stepsOf', { goal: fmt(s.stepGoal, lang) })}</T>
        </Ring>
        <Gap h={16} />
        <T kind="title" color={progress >= 1 ? c.good : c.text}>
          {progress >= 1 ? t('goalReached') : t('stepsLeft', { n: fmt(left, lang) })}
        </T>
        <Gap h={10} />
        <Pressable onPress={() => router.push('/steps')} hitSlop={10} style={[styles.pill, { backgroundColor: c.fill }]}>
          <Icon d={REFRESH} color={c.sub} size={14} />
          <T kind="caption">
            {stepEntry ? t('stepsUpdated', { t: timeLabel(stepEntry.updatedAt, lang) }) : t('updateSteps')}
          </T>
        </Pressable>
      </View>

      <Gap h={28} />
      <View style={styles.stats}>
        <Stat label={t('eaten')} value={fmt(intake, lang)} />
        <View style={[styles.vline, { backgroundColor: c.line }]} />
        <Stat label={t('used')} value={fmt(burned, lang)} />
        <View style={[styles.vline, { backgroundColor: c.line }]} />
        <Stat label={`${t('net')} kcal`} value={(net > 0 ? '+' : net < 0 ? '−' : '') + fmt(Math.abs(net), lang)} color={net <= 0 ? c.good : c.warn} />
      </View>
      {s.overCap > 0 ? (
        <>
          <Gap h={10} />
          <T kind="caption" color={c.warn} center>
            {t('overCapNote')}
          </T>
        </>
      ) : null}

      <Gap h={36} />
      <T kind="caption">{t('todayMeals')}</T>
      <Gap h={6} />
      {meals.length === 0 ? (
        <T kind="sub" style={{ paddingVertical: 12 }}>
          {t('noMeals')}
        </T>
      ) : (
        meals.map((m, i) => (
          <Pressable
            key={m.id}
            onPress={() => (armed === m.id ? removeMeal(m.id) : setArmed(armed === m.id ? null : m.id))}
            style={[styles.meal, i < meals.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line }]}>
            {m.thumb ? <Image source={{ uri: m.thumb }} style={styles.thumb} /> : <View style={[styles.thumb, { backgroundColor: c.fill }]} />}
            <View style={{ flex: 1 }}>
              <T kind="body" weight="500">
                {lang === 'th' ? m.nameTh : m.nameEn}
              </T>
              <T kind="caption" color={armed === m.id ? c.warn : undefined}>
                {armed === m.id ? t('tapToDelete') : `${timeLabel(m.time, lang)} · ${fmt(m.kcal, lang)} kcal`}
              </T>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <T kind="body" weight="600">
                {fmt(kcalToSteps(profile, m.kcal), lang)}
              </T>
              <T kind="caption">{t('stepsUnit')}</T>
            </View>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  stats: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  vline: { width: 1, height: 28 },
  meal: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  thumb: { width: 44, height: 44, borderRadius: 12 },
  dock: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
});
