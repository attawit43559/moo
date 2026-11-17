import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Pig, PigMood, Ring } from '@/components/art';
import { Btn, Card, Gap, Screen, T } from '@/components/ui';
import { kcalToSteps, summarize, todayKey } from '@/lib/energy';
import { fmt } from '@/lib/i18n';
import { pickImage } from '@/lib/image';
import { setPending } from '@/lib/pending';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

function CameraIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <Path d="M12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
    </Svg>
  );
}

function timeLabel(iso: string, lang: 'th' | 'en') {
  return new Date(iso).toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function Today() {
  const { t, state, removeMeal } = useStore();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const c = useTheme();
  const [busy, setBusy] = useState<'camera' | 'library' | null>(null);
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
  const soFarBalance = intake - s.baseSoFar - s.walkKcal;

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

  const Row = ({ label, value, sign, color }: { label: string; value: number; sign: string; color?: string }) => (
    <View style={styles.eRow}>
      <T kind="body" color={c.sub}>
        {label}
      </T>
      <T kind="body" color={color} style={{ fontWeight: '600' }}>
        {sign}
        {fmt(value, lang)} kcal
      </T>
    </View>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <T kind="label">{now.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</T>
          <T kind="display">Moo</T>
        </View>
        <Pig size={56} mood={mood} />
      </View>

      <Gap h={8} />
      <View style={{ alignItems: 'center' }}>
        <Ring progress={progress} size={250}>
          <T kind="big">{fmt(steps, lang)}</T>
          <T kind="sub">{t('stepsOf', { goal: fmt(s.stepGoal, lang) })}</T>
          <Gap h={6} />
          <T kind="body" color={progress >= 1 ? c.good : c.primary} style={{ fontWeight: '600' }}>
            {progress >= 1 ? t('goalReached') : t('stepsLeft', { n: fmt(left, lang) })}
          </T>
        </Ring>
        <Gap h={6} />
        <Pressable onPress={() => router.push('/steps')} hitSlop={8}>
          <T kind="sub" color={c.primary}>
            {stepEntry ? t('stepsUpdated', { t: timeLabel(stepEntry.updatedAt, lang) }) : t('stepsNever')} · {t('updateSteps')} ›
          </T>
        </Pressable>
      </View>

      <Gap h={20} />
      {!state.apiKey ? (
        <>
          <T kind="sub" center>
            {t('connectAiFirst')}
          </T>
          <Gap h={8} />
        </>
      ) : null}
      <View style={styles.actions}>
        <Btn
          label={t('snapMeal')}
          icon={<CameraIcon color={c.onPrimary} />}
          loading={busy === 'camera'}
          onPress={() => snap('camera')}
          style={{ flex: 2 }}
        />
        <Btn kind="soft" label={t('pickPhoto')} loading={busy === 'library'} onPress={() => snap('library')} style={{ flex: 1 }} />
      </View>

      <Gap h={24} />
      <T kind="label">{t('todayMeals')}</T>
      <Gap h={8} />
      {meals.length === 0 ? (
        <Card>
          <T kind="sub">{t('noMeals')}</T>
        </Card>
      ) : (
        <View style={{ gap: 10 }}>
          {meals.map((m) => (
            <Card key={m.id} style={styles.meal}>
              {m.thumb ? <Image source={{ uri: m.thumb }} style={styles.thumb} /> : <View style={[styles.thumb, { backgroundColor: c.primarySoft }]} />}
              <View style={{ flex: 1 }}>
                <T kind="body" style={{ fontWeight: '600' }}>
                  {lang === 'th' ? m.nameTh : m.nameEn}
                </T>
                <T kind="sub">
                  {timeLabel(m.time, lang)} · {fmt(m.kcal, lang)} kcal
                </T>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T kind="body" color={c.primary} style={{ fontWeight: '700' }}>
                  {fmt(kcalToSteps(profile, m.kcal), lang)}
                </T>
                <Pressable
                  hitSlop={10}
                  accessibilityLabel={t('deleteMeal')}
                  onPress={() => (confirmId === m.id ? removeMeal(m.id) : setConfirmId(m.id))}>
                  <T kind="sub" color={confirmId === m.id ? c.warn : c.sub}>
                    {confirmId === m.id ? t('resetConfirm') : '×'}
                  </T>
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
      )}

      <Gap h={24} />
      <T kind="label">{t('energyToday')}</T>
      <Gap h={8} />
      <Card>
        <Row label={t('eaten')} value={intake} sign="+" />
        <Row label={`${t('baseBurn')} (${t('soFar')})`} value={s.baseSoFar} sign="−" />
        <Row label={t('walkBurn')} value={s.walkKcal} sign="−" />
        <View style={[styles.divider, { backgroundColor: c.line }]} />
        <View style={styles.eRow}>
          <T kind="title">{t('balance')}</T>
          <T kind="title" color={soFarBalance <= 0 ? c.good : c.warn}>
            {soFarBalance <= 0 ? t('deficit', { n: fmt(-soFarBalance, lang) }) : t('surplus', { n: fmt(soFarBalance, lang) })}
          </T>
        </View>
        <Gap h={4} />
        <T kind="sub">
          {t('fullDay')}: {fmt(s.base, lang)} kcal {t('baseBurn').toLowerCase()}
        </T>
        {s.overCap > 0 ? (
          <>
            <Gap h={8} />
            <T kind="sub" color={c.warn}>
              {t('overCapNote')}
            </T>
          </>
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { flexDirection: 'row', gap: 10 },
  meal: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  thumb: { width: 52, height: 52, borderRadius: 14 },
  eRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  divider: { height: 1, marginVertical: 8 },
});
