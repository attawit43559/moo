import { StyleSheet, View } from 'react-native';

import { Chip, Stepper, T } from '@/components/ui';
import { Goal, Profile, Sex } from '@/lib/energy';
import { useStore } from '@/lib/store';

export function LangSwitch() {
  const { state, update } = useStore();
  return (
    <View style={styles.row}>
      <Chip label="ไทย" selected={state.lang === 'th'} onPress={() => update((s) => ({ ...s, lang: 'th' }))} />
      <Chip label="English" selected={state.lang === 'en'} onPress={() => update((s) => ({ ...s, lang: 'en' }))} />
    </View>
  );
}

export function ProfileFields({ value, onChange }: { value: Profile; onChange: (p: Profile) => void }) {
  const { t } = useStore();
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 12 }}>
      <T kind="label">{t('sex')}</T>
      <View style={styles.row}>
        {(['f', 'm'] as Sex[]).map((s) => (
          <Chip key={s} label={t(s === 'm' ? 'male' : 'female')} selected={value.sex === s} onPress={() => set('sex', s)} />
        ))}
      </View>
      <Stepper label={t('age')} value={value.age} unit={t('years')} step={1} min={18} max={90} onChange={(v) => set('age', v)} />
      <Stepper label={t('height')} value={value.heightCm} unit="cm" step={1} min={130} max={210} onChange={(v) => set('heightCm', v)} />
      <Stepper label={t('weight')} value={value.weightKg} unit="kg" step={0.5} min={35} max={200} onChange={(v) => set('weightKg', v)} />
    </View>
  );
}

export function GoalFields({ value, onChange }: { value: Goal; onChange: (g: Goal) => void }) {
  const { t } = useStore();
  const opts: { g: Goal; label: 'goalLose' | 'goalMaintain' | 'goalLearn'; hint: 'goalLoseHint' | 'goalMaintainHint' | 'goalLearnHint' }[] = [
    { g: 'lose', label: 'goalLose', hint: 'goalLoseHint' },
    { g: 'maintain', label: 'goalMaintain', hint: 'goalMaintainHint' },
    { g: 'learn', label: 'goalLearn', hint: 'goalLearnHint' },
  ];
  return (
    <View style={{ gap: 10 }}>
      {opts.map((o) => (
        <View key={o.g} style={styles.row}>
          <Chip label={t(o.label)} hint={t(o.hint)} selected={value === o.g} onPress={() => onChange(o.g)} />
        </View>
      ))}
    </View>
  );
}

export const defaultProfile: Profile = { sex: 'f', age: 30, heightCm: 160, weightKg: 60, goal: 'lose' };

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 10 } });
