import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { GoalFields, LangSwitch, ProfileFields } from '@/components/profile';
import { Btn, Gap, Group, Row, Screen, T } from '@/components/ui';
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
  const [showFormula, setShowFormula] = useState(false);
  const p = state.profile!;
  const used = state.aiUsage[todayKey()] ?? 0;

  return (
    <Screen>
      <T kind="display">{t('tabSettings')}</T>
      <Gap h={24} />

      <T kind="title" style={{ marginBottom: 10 }}>
        {t('language')}
      </T>
      <LangSwitch />
      <Gap h={24} />

      <Group title={t('ai')}>
        <Row
          last
          label={state.apiKey ? t('aiConnected') : t('aiTitle')}
          sub={state.apiKey ? t('aiUsedToday', { n: used }) : undefined}
          onPress={() => router.push('/connect-ai')}
          right={state.apiKey ? <View style={[styles.dot, { backgroundColor: c.good }]} /> : undefined}
        />
      </Group>

      <T kind="title" style={{ marginBottom: 10 }}>
        {t('profile')}
      </T>
      <ProfileFields value={p} onChange={(np) => update((s) => ({ ...s, profile: np }))} />
      <GoalFields value={p.goal} onChange={(goal) => update((s) => ({ ...s, profile: { ...p, goal } }))} />
      <Gap h={24} />

      <Group title={t('data')}>
        <Row label={t('exportCsv')} sub={t('exportHint')} onPress={() => download(`moo-${todayKey()}.csv`, buildCsv(state))} />
        <Row label={t('formula')} onPress={() => setShowFormula(!showFormula)} last={!showFormula} />
        {showFormula ? (
          <View style={{ paddingBottom: 14 }}>
            <T kind="caption">{t('formulaBody', { kps: kcalPerStep(p).toFixed(3), spk: fmt(kcalToSteps(p, 100), state.lang) })}</T>
          </View>
        ) : null}
      </Group>

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
      <T kind="caption" center>
        {t('dataLocal')}
      </T>
      <T kind="caption" center>
        {t('disclaimer')}
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({ dot: { width: 8, height: 8, borderRadius: 4 } });
