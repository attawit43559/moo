import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Pig, PigMood } from '@/components/art';
import { Gap, Screen, T } from '@/components/ui';
import { kcalToSteps, strideM, summarize, todayKey } from '@/lib/energy';
import { fmt } from '@/lib/i18n';
import { useSnap } from '@/lib/snap';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

const PLATE = 290;
const PLATES = ['#CBEFFC', '#FFE3EA', '#D6F4E2', '#FFF3A6'];

/** Today's steps served on a plate: the rim fills up as you walk. */
function Plate({ progress, children }: { progress: number; children: React.ReactNode }) {
  const c = useTheme();
  const p = Math.max(0, Math.min(1, progress));
  const r = PLATE / 2 - 6;
  const circ = 2 * Math.PI * r;
  const a = -Math.PI / 2 + p * 2 * Math.PI;
  const dot = { x: PLATE / 2 + r * Math.cos(a), y: PLATE / 2 + r * Math.sin(a) };
  return (
    <View style={{ width: PLATE, height: PLATE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={PLATE} height={PLATE} style={{ position: 'absolute' }}>
        <Circle cx={PLATE / 2} cy={PLATE / 2} r={r} stroke={c.line} strokeWidth={2} fill="none" />
        {p > 0 ? (
          <Circle
            cx={PLATE / 2}
            cy={PLATE / 2}
            r={r}
            stroke={c.ink}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={circ * (1 - Math.max(p, 0.01))}
            transform={`rotate(-90 ${PLATE / 2} ${PLATE / 2})`}
          />
        ) : null}
        <Circle cx={PLATE / 2} cy={PLATE / 2} r={r - 18} fill={c.lime} />
        <Circle cx={dot.x} cy={dot.y} r={8} fill={c.ink} />
      </Svg>
      {children}
    </View>
  );
}

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
  const km = ((left * strideM(profile)) / 1000).toFixed(1);

  return (
    <Screen>
      <View style={styles.top}>
        <T kind="display" style={{ fontSize: 26 }}>
          moo
        </T>
        <T kind="caption">{now.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</T>
      </View>

      <Gap h={18} />
      <View style={styles.center}>
        <Plate progress={progress}>
          <T kind="caption" color={c.text}>
            {t('walkedToday')}
          </T>
          <T kind="hero" style={{ fontSize: 64, lineHeight: 72 }}>
            {fmt(steps, lang)}
          </T>
          <T kind="caption" color={c.text}>
            {t('stepsOf', { goal: fmt(s.stepGoal, lang) })}
          </T>
        </Plate>
        <View style={styles.pig} pointerEvents="none">
          <Pig size={84} mood={mood} />
        </View>
      </View>

      <Gap h={14} />
      <T kind="title" center>
        {done ? t('goalReached') : t('billLeftHint', { n: fmt(left, lang), km })}
      </T>
      <Gap h={8} />
      <Pressable accessibilityRole="button" onPress={() => router.push('/steps')} hitSlop={8} style={{ alignSelf: 'center' }}>
        <T kind="caption" style={styles.link}>
          {stepEntry ? t('stepsUpdated', { t: timeLabel(stepEntry.updatedAt, lang) }) : t('updateSteps')}
        </T>
      </Pressable>

      <Gap h={26} />
      <View style={styles.energy}>
        <View style={styles.eItem}>
          <T kind="num">{fmt(intake, lang)}</T>
          <T kind="caption">{t('eaten')}</T>
        </View>
        <T kind="title" color={c.sub}>
          −
        </T>
        <View style={styles.eItem}>
          <T kind="num">{fmt(burned, lang)}</T>
          <T kind="caption">{t('used')}</T>
        </View>
        <T kind="title" color={c.sub}>
          =
        </T>
        <View style={styles.eItem}>
          <T kind="num" color={net <= 0 ? c.good : c.warn}>
            {(net > 0 ? '+' : net < 0 ? '−' : '') + fmt(Math.abs(net), lang)}
          </T>
          <T kind="caption">kcal</T>
        </View>
      </View>

      <Gap h={30} />
      <T kind="title">{t('todayMeals')}</T>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -22 }} contentContainerStyle={styles.meals}>
        {meals.map((m, i) => {
          const on = armed === m.id;
          return (
            <Pressable
              key={m.id}
              accessibilityRole="button"
              accessibilityLabel={on ? t('tapToDelete') : lang === 'th' ? m.nameTh : m.nameEn}
              onPress={() => (on ? removeMeal(m.id) : setArmed(m.id))}
              style={styles.meal}>
              <View style={[styles.mealPlate, { backgroundColor: on ? c.warnSoft : PLATES[i % PLATES.length] }]}>
                {m.thumb ? <Image source={{ uri: m.thumb }} style={styles.mealImg} contentFit="cover" /> : null}
              </View>
              <T kind="caption" color={on ? c.warn : c.text} center style={{ maxWidth: 88 }}>
                {on ? t('tapToDelete') : lang === 'th' ? m.nameTh : m.nameEn}
              </T>
              <T kind="caption" weight="600" color={c.text} center>
                {fmt(kcalToSteps(profile, m.kcal), lang)} {t('stepsUnit')}
              </T>
              <T kind="caption" center style={{ fontSize: 11 }}>
                {timeLabel(m.time, lang)}
              </T>
            </Pressable>
          );
        })}
        <Pressable accessibilityRole="button" accessibilityLabel={t('fromGallery')} onPress={() => snap('library')} style={styles.meal}>
          <View style={[styles.mealPlate, styles.add, { borderColor: c.line }]}>
            {busy === 'library' ? (
              <ActivityIndicator color={c.sub} />
            ) : (
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c.sub} strokeWidth={2} strokeLinecap="round">
                <Path d="M12 5v14M5 12h14" />
              </Svg>
            )}
          </View>
          <T kind="caption" center style={{ maxWidth: 88 }}>
            {t('fromGallery')}
          </T>
        </Pressable>
      </ScrollView>
      {meals.length === 0 ? <T kind="caption">{t('noMeals')}</T> : null}
      <Gap h={24} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  center: { alignItems: 'center' },
  pig: { position: 'absolute', right: 8, bottom: -6 },
  link: { textDecorationLine: 'underline' },
  energy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  eItem: { alignItems: 'center' },
  meals: { gap: 16, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 4 },
  meal: { alignItems: 'center', gap: 4, width: 88 },
  mealPlate: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  mealImg: { width: 58, height: 58, borderRadius: 29 },
  add: { borderWidth: 1.5, borderStyle: 'dashed' },
});
