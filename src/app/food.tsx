import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Pig } from '@/components/art';
import { Btn, Card, Chip, Gap, Screen, T } from '@/components/ui';
import { kcalToSteps, todayKey } from '@/lib/energy';
import { analyzeFood, FoodGuess, FoodResult, KeyError, QuotaError } from '@/lib/gemini';
import { fmt } from '@/lib/i18n';
import { Picked } from '@/lib/image';
import { getPending } from '@/lib/pending';
import { newId, useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

const PORTIONS = [
  { key: 'small', f: 0.7 },
  { key: 'normal', f: 1 },
  { key: 'large', f: 1.4 },
] as const;

export default function Food() {
  const { t, state, addMeal, bumpAi } = useStore();
  const c = useTheme();
  const photo = useRef<Picked | null>(getPending());
  const [result, setResult] = useState<FoodResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [choice, setChoice] = useState(0);
  const [portion, setPortion] = useState(1);
  const [eaten, setEaten] = useState(1);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const run = async () => {
    const p = photo.current;
    if (!p || !state.apiKey) return close();
    setError(null);
    setResult(null);
    try {
      bumpAi();
      setResult(await analyzeFood(state.apiKey, p.base64));
    } catch (e) {
      setError(e instanceof QuotaError ? t('aiQuota') : e instanceof KeyError ? t('aiBad') : t('aiError'));
    }
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state.profile) return null;
  const profile = state.profile;
  const options: FoodGuess[] = result ? [result.best, ...result.alternatives] : [];
  const g = options[choice];
  const factor = portion * eaten;
  const kcal = g ? Math.round(g.kcal * factor) : 0;
  const steps = kcalToSteps(profile, kcal);
  const name = (x: FoodGuess) => (state.lang === 'th' ? x.nameTh : x.nameEn);

  const save = () => {
    if (!g) return;
    addMeal({
      id: newId(),
      date: todayKey(),
      time: new Date().toISOString(),
      nameTh: g.nameTh,
      nameEn: g.nameEn,
      kcal,
      thumb: photo.current?.thumb,
    });
    close();
  };

  return (
    <Screen>
      {photo.current ? <Image source={{ uri: `data:image/jpeg;base64,${photo.current.base64}` }} style={styles.photo} contentFit="cover" /> : null}
      <Gap h={16} />

      {!result && !error && (
        <View style={styles.center}>
          <Pig size={80} mood="calm" />
          <Gap />
          <ActivityIndicator color={c.primary} />
          <Gap h={8} />
          <T kind="body" color={c.sub}>
            {t('analyzing')}
          </T>
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <T kind="body" center>
            {error}
          </T>
          <Gap />
          <Btn label={t('retry')} onPress={run} style={{ alignSelf: 'stretch' }} />
          <Gap h={8} />
          <Btn kind="ghost" label={t('cancel')} onPress={close} style={{ alignSelf: 'stretch' }} />
        </View>
      )}

      {result && !result.isFood && (
        <View style={styles.center}>
          <Pig size={80} mood="calm" />
          <Gap />
          <T kind="body" center>
            {t('notFood')}
          </T>
          <Gap />
          <Btn kind="ghost" label={t('back')} onPress={close} style={{ alignSelf: 'stretch' }} />
        </View>
      )}

      {result && result.isFood && g && (
        <>
          <Card style={{ alignItems: 'center' }}>
            <T kind="title" center>
              {name(g)}
            </T>
            <Gap h={4} />
            <T kind="big" color={c.primary}>
              {t('equalsSteps', { n: fmt(steps, state.lang) })}
            </T>
            <T kind="sub">
              {fmt(kcal, state.lang)} kcal · {t('range', { lo: fmt(g.kcalLow * factor, state.lang), hi: fmt(g.kcalHigh * factor, state.lang) })}
            </T>
          </Card>

          {options.length > 1 && (
            <>
              <Gap h={16} />
              <T kind="label">{t('isItThis')}</T>
              <Gap h={8} />
              <View style={{ gap: 8 }}>
                {options.map((o, i) => (
                  <View key={i} style={styles.row}>
                    <Chip label={name(o)} hint={`${fmt(o.kcal, state.lang)} kcal`} selected={choice === i} onPress={() => setChoice(i)} />
                  </View>
                ))}
              </View>
            </>
          )}

          <Gap h={16} />
          <T kind="label">{t('portion')}</T>
          <Gap h={8} />
          <View style={styles.row}>
            {PORTIONS.map((p) => (
              <Chip key={p.key} label={t(p.key)} selected={portion === p.f} onPress={() => setPortion(p.f)} />
            ))}
          </View>

          <Gap h={16} />
          <T kind="label">{t('ate')}</T>
          <Gap h={8} />
          <View style={styles.row}>
            <Chip label={t('ateAll')} selected={eaten === 1} onPress={() => setEaten(1)} />
            <Chip label={t('ateHalf')} selected={eaten === 0.5} onPress={() => setEaten(0.5)} />
          </View>

          <Gap h={24} />
          <Btn label={t('saveMeal')} onPress={save} />
          <Gap h={8} />
          <Btn kind="ghost" label={t('cancel')} onPress={close} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 24 },
  center: { alignItems: 'center', paddingVertical: 24 },
  row: { flexDirection: 'row', gap: 10 },
});
