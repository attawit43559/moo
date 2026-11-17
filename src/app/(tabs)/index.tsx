import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Bar, Pig, PigMood } from '@/components/art';
import { Gap, Screen, T, Tag } from '@/components/ui';
import { kcalToSteps, summarize, todayKey } from '@/lib/energy';
import { fmt } from '@/lib/i18n';
import { useSnap } from '@/lib/snap';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

function Icon({ d, color, size = 20 }: { d: string; color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d={d} />
    </Svg>
  );
}
const REFRESH = 'M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6';
const ARROW = 'M5 12h14M13 6l6 6-6 6';
const GALLERY = 'M4 5h16v14H4zM4 15l4.5-4.5 4 4 2.5-2.5L20 17';

function timeLabel(iso: string, lang: 'th' | 'en') {
  return new Date(iso).toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function Today() {
  const { t, state, removeMeal } = useStore();
  const c = useTheme();
  const { busy, snap } = useSnap();
  const [armed, setArmed] = useState<string | null>(null);
  const profile = state.profile!;
  const lang = state.lang;
  const loc = lang === 'th' ? 'th-TH' : 'en-US';
  const today = todayKey();
  const meals = state.meals.filter((m) => m.date === today);
  const intake = meals.reduce((a, m) => a + m.kcal, 0);
  const stepEntry = state.steps[today];
  const steps = stepEntry?.count ?? 0;
  const now = new Date();
  const s = summarize(profile, intake, steps, now);
  const progress = s.stepGoal ? steps / s.stepGoal : 0;
  const left = Math.max(0, s.stepGoal - steps);
  const done = progress >= 1;
  const mood: PigMood = done ? 'proud' : progress >= 0.5 ? 'happy' : 'calm';
  const burned = s.baseSoFar + s.walkKcal;
  const net = intake - burned;
  const mealColors = [c.sky, c.pinkLight, c.mint, c.butter];

  // This week, Sunday first, like a pocket calendar.
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - now.getDay() + i);
    const key = todayKey(d);
    const has = state.meals.some((m) => m.date === key) || !!state.steps[key];
    return { key, d, isToday: key === today, has };
  });

  const Stat = ({ value, label, color }: { value: string; label: string; color?: string }) => (
    <View style={{ flex: 1 }}>
      <T kind="num" color={color}>
        {value}
      </T>
      <T kind="caption">{label}</T>
    </View>
  );

  return (
    <Screen>
      <View style={styles.top}>
        <View>
          <T kind="display">{t('tabToday')}</T>
          <T kind="sub">{now.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' })}</T>
        </View>
        <Pig size={60} mood={mood} />
      </View>

      <Gap h={16} />
      <View style={[styles.week, { backgroundColor: c.card }]}>
        {week.map((w) => (
          <View key={w.key} style={styles.day}>
            <T kind="caption" color={c.sub}>
              {w.d.toLocaleDateString(loc, { weekday: 'narrow' })}
            </T>
            <View style={[styles.dayNum, w.isToday && { backgroundColor: c.ink }]}>
              <T kind="body" weight="500" color={w.isToday ? c.onPrimary : c.text}>
                {w.d.getDate()}
              </T>
              <View style={[styles.dayDot, { backgroundColor: w.has ? (w.isToday ? c.onPrimary : c.ink) : 'transparent' }]} />
            </View>
          </View>
        ))}
      </View>

      <Gap h={12} />
      <View style={[styles.hero, { backgroundColor: c.lime }]}>
        <T kind="body" weight="500">
          {t('walkedToday')}
        </T>
        <T kind="hero">{fmt(steps, lang)}</T>
        <T kind="sub" color={c.text}>
          {done ? t('goalLineDone', { goal: fmt(s.stepGoal, lang) }) : t('goalLine', { goal: fmt(s.stepGoal, lang), n: fmt(left, lang) })}
        </T>
        <Gap h={14} />
        <Bar progress={progress} />
        <Gap h={14} />
        <View style={styles.heroRow}>
          <T kind="caption" color={c.text}>
            {stepEntry ? t('stepsUpdated', { t: timeLabel(stepEntry.updatedAt, lang) }) : t('stepsNever')}
          </T>
          <Pressable accessibilityRole="button" accessibilityLabel={t('updateSteps')} onPress={() => router.push('/steps')} style={[styles.round, { backgroundColor: c.ink }]}>
            <Icon d={REFRESH} color={c.onPrimary} />
          </Pressable>
        </View>
      </View>

      <Gap h={12} />
      <View style={[styles.card, styles.stats, { backgroundColor: c.slate }]}>
        <Stat value={fmt(intake, lang)} label={`${t('eaten')} kcal`} />
        <Stat value={fmt(burned, lang)} label={`${t('used')} kcal`} />
        <Stat value={(net > 0 ? '+' : net < 0 ? '−' : '') + fmt(Math.abs(net), lang)} label={`${t('net')} kcal`} color={net <= 0 ? c.good : c.warn} />
      </View>
      {s.overCap > 0 ? (
        <>
          <Gap h={8} />
          <T kind="caption" color={c.warn} center>
            {t('overCapNote')}
          </T>
        </>
      ) : null}

      <Gap h={12} />
      <Pressable accessibilityRole="button" onPress={() => router.push('/bill')} style={[styles.card, styles.billCard, { backgroundColor: c.butter }]}>
        <View style={{ flex: 1 }}>
          <T kind="title">{t('seeBill')}</T>
          <T kind="caption" color={c.text}>
            {t('billCardSub', { goal: fmt(s.stepGoal, lang), paid: fmt(steps, lang) })}
          </T>
        </View>
        <View style={[styles.round, { backgroundColor: c.ink }]}>
          <Icon d={ARROW} color={c.onPrimary} />
        </View>
      </Pressable>

      <Gap h={24} />
      <View style={styles.mealsHead}>
        <T kind="title">{t('todayMeals')}</T>
        <Pressable accessibilityRole="button" onPress={() => snap('library')} hitSlop={8} style={styles.gallery}>
          {busy === 'library' ? <ActivityIndicator color={c.sub} /> : <Icon d={GALLERY} color={c.sub} size={16} />}
          <T kind="caption">{t('fromGallery')}</T>
        </Pressable>
      </View>
      <Gap h={10} />
      {meals.length === 0 ? (
        <View style={[styles.card, { backgroundColor: c.card }]}>
          <T kind="sub">{t('noMeals')}</T>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {meals.map((m, i) => {
            const on = armed === m.id;
            return (
              <Pressable
                key={m.id}
                accessibilityRole="button"
                accessibilityLabel={on ? t('tapToDelete') : lang === 'th' ? m.nameTh : m.nameEn}
                onPress={() => (on ? removeMeal(m.id) : setArmed(m.id))}
                style={[styles.card, styles.meal, { backgroundColor: on ? c.warnSoft : mealColors[i % mealColors.length] }]}>
                <View style={{ flex: 1 }}>
                  <T kind="title">{lang === 'th' ? m.nameTh : m.nameEn}</T>
                  <T kind="caption" color={on ? c.warn : c.sub}>
                    {on ? t('tapToDelete') : `${timeLabel(m.time, lang)} · ${fmt(m.kcal, lang)} kcal`}
                  </T>
                  <Gap h={8} />
                  <Tag label={`${fmt(kcalToSteps(profile, m.kcal), lang)} ${t('stepsUnit')}`} />
                </View>
                {m.thumb ? (
                  <Image source={{ uri: m.thumb }} style={styles.thumb} contentFit="cover" />
                ) : (
                  <View style={[styles.thumb, { backgroundColor: c.bg }]} />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
      <Gap h={110} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  week: { flexDirection: 'row', borderRadius: 26, paddingVertical: 12, paddingHorizontal: 6 },
  day: { flex: 1, alignItems: 'center', gap: 6 },
  dayNum: { width: 38, height: 52, borderRadius: 19, alignItems: 'center', justifyContent: 'center', gap: 2 },
  dayDot: { width: 4, height: 4, borderRadius: 2 },
  hero: { borderRadius: 30, padding: 22, paddingBottom: 18 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  round: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 26, padding: 18 },
  stats: { flexDirection: 'row', gap: 8 },
  billCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mealsHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gallery: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meal: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  thumb: { width: 64, height: 64, borderRadius: 32 },
});
