import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Pig } from '@/components/art';
import { Btn, Gap, Screen, Segmented, T } from '@/components/ui';
import { kcalToSteps, todayKey } from '@/lib/energy';
import { analyzeFood, FoodGuess, FoodResult, KeyError, QuotaError } from '@/lib/gemini';
import { fmt } from '@/lib/i18n';
import { Picked } from '@/lib/image';
import { getPending } from '@/lib/pending';
import { newId, useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

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
  const lang = state.lang;
  const options: FoodGuess[] = result ? [result.best, ...result.alternatives] : [];
  const g = options[choice];
  const factor = portion * eaten;
  const kcal = g ? Math.round(g.kcal * factor) : 0;
  const steps = kcalToSteps(profile, kcal);
  const name = (x: FoodGuess) => (lang === 'th' ? x.nameTh : x.nameEn);
  const ok = result?.isFood && g;

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
    <Screen
      footer={
        ok ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Btn kind="quiet" label={t('cancel')} onPress={close} style={{ flex: 1 }} />
            <Btn label={t('saveMeal')} onPress={save} style={{ flex: 2 }} />
          </View>
        ) : undefined
      }>
      {photo.current ? (
        <Image source={{ uri: `data:image/jpeg;base64,${photo.current.base64}` }} style={styles.photo} contentFit="cover" />
      ) : null}

      {!result && !error && (
        <View style={styles.center}>
          <ActivityIndicator color={c.sub} />
          <Gap h={10} />
          <T kind="sub">{t('analyzing')}</T>
        </View>
      )}

      {(error || (result && !result.isFood)) && (
        <View style={styles.center}>
          <Pig size={64} mood="calm" />
          <Gap />
          <T kind="body" center>
            {error ?? t('notFood')}
          </T>
          <Gap h={20} />
          {error ? <Btn label={t('retry')} onPress={run} style={{ alignSelf: 'stretch' }} /> : null}
          <Btn kind="ghost" label={t('back')} onPress={close} style={{ alignSelf: 'stretch' }} />
        </View>
      )}

      {ok && (
        <>
          <Gap h={28} />
          <T kind="sub" center>
            {name(g)}
          </T>
          <T kind="hero" center color={c.primary}>
            {fmt(steps, lang)}
          </T>
          <T kind="sub" center>
            {t('stepsUnit')} · {fmt(kcal, lang)} kcal
          </T>
          <T kind="caption" center>
            {t('range', { lo: fmt(g.kcalLow * factor, lang), hi: fmt(g.kcalHigh * factor, lang) })}
          </T>

          {options.length > 1 && (
            <>
              <Gap h={28} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {options.map((o, i) => {
                  const on = choice === i;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => setChoice(i)}
                      style={[styles.tag, { backgroundColor: on ? c.text : c.fill }]}>
                      <T kind="caption" weight="600" color={on ? c.bg : c.text}>
                        {name(o)}
                      </T>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          )}

          <Gap h={24} />
          <T kind="caption">{t('portion')}</T>
          <Gap h={8} />
          <Segmented
            options={[
              { value: 0.7, label: t('small') },
              { value: 1, label: t('normal') },
              { value: 1.4, label: t('large') },
            ]}
            value={portion}
            onChange={setPortion}
          />
          <Gap h={16} />
          <T kind="caption">{t('ate')}</T>
          <Gap h={8} />
          <Segmented
            options={[
              { value: 1, label: t('ateAll') },
              { value: 0.5, label: t('ateHalf') },
            ]}
            value={eaten}
            onChange={setEaten}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 28 },
  center: { alignItems: 'center', paddingVertical: 32 },
  tag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
});
