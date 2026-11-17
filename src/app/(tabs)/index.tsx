import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Bar, Pig, PigMood } from '@/components/art';
import { Btn, Gap, RoundBtn, Screen, Sticker, T, Tag } from '@/components/ui';
import { kcalToSteps, summarize, todayKey } from '@/lib/energy';
import { fmt } from '@/lib/i18n';
import { pickImage } from '@/lib/image';
import { setPending } from '@/lib/pending';
import { useStore } from '@/lib/store';
import { BORDER, shadow, useTheme } from '@/lib/theme';

function Icon({ d, color, size = 24, w = 2.4 }: { d: string; color: string; size?: number; w?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <Path d={d} />
    </Svg>
  );
}
const CAMERA = 'M4 8.5h2.6l1.6-2.5h7.6l1.6 2.5H20v10.5H4zM12 16.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z';
const GALLERY = 'M4 5h16v14H4zM4 15l4.5-4.5 4 4 2.5-2.5L20 17M15.5 9.5h.01';

const TILTS = [-4, 3, -2, 2.5, -3];

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
  const done = progress >= 1;
  const mood: PigMood = done ? 'proud' : progress >= 0.5 ? 'happy' : 'calm';
  const bubble = done ? t('bubbleDone') : progress >= 0.75 ? t('bubbleClose') : t('bubbleStart');
  const burned = s.baseSoFar + s.walkKcal;
  const net = intake - burned;
  const dateLabel = now.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });

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

  const Tile = ({ value, label, color }: { value: string; label: string; color: string }) => (
    <View style={[styles.tile, { backgroundColor: color, borderColor: c.ink }, shadow(3)]}>
      <T kind="num">{value}</T>
      <T kind="caption" color={c.ink}>
        {label}
      </T>
    </View>
  );

  return (
    <Screen
      footer={
        <View style={styles.dock}>
          <Btn
            label={t('snapThis')}
            icon={<Icon d={CAMERA} color={c.ink} />}
            loading={busy === 'camera'}
            onPress={() => snap('camera')}
            style={{ flex: 1 }}
          />
          <RoundBtn size={58} kind="quiet" label={t('pickPhoto')} loading={busy === 'library'} onPress={() => snap('library')}>
            <Icon d={GALLERY} color={c.ink} size={24} w={2.2} />
          </RoundBtn>
        </View>
      }>
      <View style={styles.top}>
        <T kind="display" style={{ fontSize: 36, letterSpacing: -1.5 }}>
          moo.
        </T>
        <View style={[styles.date, { backgroundColor: c.ink }]}>
          <T kind="caption" color={c.bg} weight="500">
            {dateLabel}
          </T>
        </View>
      </View>

      <Gap h={44} />
      <Sticker color={c.lime} style={styles.hero}>
        <View style={[styles.bubble, { backgroundColor: c.card, borderColor: c.ink }]}>
          <T kind="caption" weight="500" color={c.ink}>
            {bubble}
          </T>
        </View>
        <View style={styles.pig} pointerEvents="none">
          <Pig size={92} mood={mood} />
        </View>
        <T kind="body" weight="500">
          {t('walkedToday')}
        </T>
        <T kind="hero" style={{ marginTop: 4 }}>
          {fmt(steps, lang)}
        </T>
        <T kind="body" weight="500">
          {done ? t('goalLineDone', { goal: fmt(s.stepGoal, lang) }) : t('goalLine', { goal: fmt(s.stepGoal, lang), n: fmt(left, lang) })}
        </T>
        <Gap h={14} />
        <Bar progress={progress} />
        <Gap h={12} />
        <View style={styles.heroLinks}>
          <Pressable onPress={() => router.push('/steps')} hitSlop={8} accessibilityRole="button">
            <T kind="caption" weight="600" color={c.ink} style={styles.underline}>
              {stepEntry ? t('stepsUpdated', { t: timeLabel(stepEntry.updatedAt, lang) }) : t('updateSteps')}
            </T>
          </Pressable>
          <Pressable onPress={() => router.push('/bill')} hitSlop={8} accessibilityRole="button">
            <T kind="caption" weight="600" color={c.ink} style={styles.underline}>
              {t('seeBill')} →
            </T>
          </Pressable>
        </View>
      </Sticker>

      <Gap h={18} />
      <View style={styles.tiles}>
        <Tile value={fmt(intake, lang)} label={`${t('eaten')} kcal`} color={c.sky} />
        <Tile value={fmt(burned, lang)} label={`${t('used')} kcal`} color={c.butter} />
        <Tile value={(net > 0 ? '+' : net < 0 ? '−' : '') + fmt(Math.abs(net), lang)} label={`${t('net')} kcal`} color={c.card} />
      </View>
      {s.overCap > 0 ? (
        <>
          <Gap h={10} />
          <T kind="caption" color={c.warn} center>
            {t('overCapNote')}
          </T>
        </>
      ) : null}

      <Gap h={24} />
      <T kind="title">{t('todayMeals')}</T>
      <Gap h={4} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.meals} style={{ marginHorizontal: -22 }}>
        {meals.map((m, i) => {
          const on = armed === m.id;
          return (
            <Pressable
              key={m.id}
              accessibilityRole="button"
              accessibilityLabel={on ? t('tapToDelete') : lang === 'th' ? m.nameTh : m.nameEn}
              onPress={() => (on ? removeMeal(m.id) : setArmed(m.id))}
              style={[
                styles.pol,
                { backgroundColor: on ? c.warnSoft : c.card, borderColor: c.ink, transform: [{ rotate: `${TILTS[i % TILTS.length]}deg` }] },
                shadow(3),
              ]}>
              {m.thumb ? (
                <Image source={{ uri: m.thumb }} style={[styles.img, { borderColor: c.ink }]} contentFit="cover" />
              ) : (
                <View style={[styles.img, { borderColor: c.ink, backgroundColor: c.primarySoft }]} />
              )}
              <T kind="caption" weight="500" color={c.ink} style={{ marginTop: 6 }}>
                {on ? t('tapToDelete') : lang === 'th' ? m.nameTh : m.nameEn}
              </T>
              <Tag label={`${fmt(kcalToSteps(profile, m.kcal), lang)} ${t('stepsUnit')}`} style={{ marginTop: 4 }} />
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('snapMeal')}
          onPress={() => snap('camera')}
          style={[styles.pol, styles.next, { borderColor: c.ink, transform: [{ rotate: meals.length ? '2deg' : '0deg' }] }]}>
          <T kind="caption" weight="500" center>
            {meals.length ? t('nextMeal') : t('noMeals')}
          </T>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  hero: { borderRadius: 28, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 16, boxShadow: '5px 5px 0 #1B1B1B' },
  pig: { position: 'absolute', right: -6, top: -40, transform: [{ rotate: '8deg' }] },
  bubble: { position: 'absolute', right: 84, top: -26, borderWidth: BORDER, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5, transform: [{ rotate: '-3deg' }] },
  heroLinks: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  underline: { textDecorationLine: 'underline' },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: { flex: 1, borderWidth: BORDER, borderRadius: 20, padding: 12 },
  meals: { gap: 14, paddingHorizontal: 22, paddingVertical: 14, alignItems: 'flex-start' },
  pol: { width: 124, borderWidth: BORDER, borderRadius: 18, padding: 8, paddingBottom: 10 },
  img: { height: 88, borderRadius: 12, borderWidth: 2 },
  next: { height: 166, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  dock: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
