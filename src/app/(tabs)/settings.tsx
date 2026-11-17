import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { GoalFields, LangSwitch, ProfileFields } from '@/components/profile';
import { Btn, Card, Gap, Screen, T } from '@/components/ui';
import { kcalPerStep, kcalToSteps, summarize, todayKey } from '@/lib/energy';
import { fmt } from '@/lib/i18n';
import { State, useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

function buildCsv(s: State): string {
  const p = s.profile!;
  const dates = new Set<string>([...s.meals.map((m) => m.date), ...Object.keys(s.steps)]);
  const lines = ['date,intake_kcal,meals,steps,base_kcal,walk_kcal,balance_kcal,step_goal'];
  for (const d of [...dates].sort()) {
    const ms = s.meals.filter((m) => m.date === d);
    const intake = ms.reduce((a, m) => a + m.kcal, 0);
    const steps = s.steps[d]?.count ?? 0;
    const sum = summarize(p, intake, steps);
    lines.push([d, intake, ms.length, steps, sum.base, sum.walkKcal, sum.balance, sum.stepGoal].join(','));
  }
  lines.push('', 'meal_date,meal_time,name_th,name_en,kcal');
  for (const m of s.meals) {
    const q = (x: string) => `"${x.replace(/"/g, '""')}"`;
    lines.push([m.date, m.time, q(m.nameTh), q(m.nameEn), m.kcal].join(','));
  }
  return '﻿' + lines.join('\n'); // BOM so Excel reads Thai correctly
}

function download(name: string, text: string) {
  if (Platform.OS !== 'web') return;
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Settings() {
  const { t, state, update, reset } = useStore();
  const c = useTheme();
  const [confirm, setConfirm] = useState(false);
  const p = state.profile!;
  const used = state.aiUsage[todayKey()] ?? 0;

  return (
    <Screen>
      <T kind="display">{t('tabSettings')}</T>
      <Gap h={16} />

      <T kind="label">{t('language')}</T>
      <Gap h={8} />
      <LangSwitch />

      <Gap h={24} />
      <T kind="label">{t('ai')}</T>
      <Gap h={8} />
      <Pressable onPress={() => router.push('/connect-ai')}>
        <Card>
          <T kind="title" color={state.apiKey ? c.good : c.primary}>
            {state.apiKey ? `✓ ${t('aiConnected')}` : t('aiTitle')} ›
          </T>
          {state.apiKey ? <T kind="sub">{t('aiUsedToday', { n: used })}</T> : null}
        </Card>
      </Pressable>

      <Gap h={24} />
      <T kind="label">{t('profile')}</T>
      <Gap h={8} />
      <ProfileFields value={p} onChange={(np) => update((s) => ({ ...s, profile: np }))} />
      <Gap h={12} />
      <GoalFields value={p.goal} onChange={(goal) => update((s) => ({ ...s, profile: { ...p, goal } }))} />

      <Gap h={24} />
      <T kind="label">{t('formula')}</T>
      <Gap h={8} />
      <Card>
        <T kind="sub" color={c.text}>
          {t('formulaBody', { kps: kcalPerStep(p).toFixed(3), spk: fmt(kcalToSteps(p, 100), state.lang) })}
        </T>
      </Card>

      <Gap h={24} />
      <T kind="label">{t('data')}</T>
      <Gap h={8} />
      <T kind="sub">{t('dataLocal')}</T>
      <Gap h={8} />
      <Btn kind="soft" label={t('exportCsv')} onPress={() => download(`moo-${todayKey()}.csv`, buildCsv(state))} />
      <Gap h={4} />
      <T kind="sub" center>
        {t('exportHint')}
      </T>
      <Gap h={12} />
      <Btn
        kind="danger"
        label={confirm ? t('resetConfirm') : t('resetAll')}
        onPress={() => {
          if (!confirm) return setConfirm(true);
          reset();
          router.replace('/onboarding');
        }}
      />
      <Gap h={24} />
      <View style={{ alignItems: 'center' }}>
        <T kind="sub" center>
          Moo · {t('appTagline')}
        </T>
        <T kind="sub" center>
          {t('disclaimer')}
        </T>
      </View>
    </Screen>
  );
}
