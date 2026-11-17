import { View } from 'react-native';

import { Group, Row, Segmented, Stepper, T } from '@/components/ui';
import { Goal, Profile, Sex } from '@/lib/energy';
import { useStore } from '@/lib/store';

export function LangSwitch() {
  const { state, update } = useStore();
  return (
    <Segmented
      options={[
        { value: 'th', label: 'ไทย' },
        { value: 'en', label: 'English' },
      ]}
      value={state.lang}
      onChange={(lang) => update((s) => ({ ...s, lang }))}
    />
  );
}

export function ProfileFields({ value, onChange, title }: { value: Profile; onChange: (p: Profile) => void; title?: string }) {
  const { t } = useStore();
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => onChange({ ...value, [k]: v });
  return (
    <View>
      <Segmented<Sex>
        options={[
          { value: 'f', label: t('female') },
          { value: 'm', label: t('male') },
        ]}
        value={value.sex}
        onChange={(v) => set('sex', v)}
      />
      <View style={{ height: 16 }} />
      <Group title={title}>
        <Row label={t('age')} right={<Stepper label={t('age')} value={value.age} unit={t('years')} step={1} min={18} max={90} onChange={(v) => set('age', v)} />} />
        <Row label={t('height')} right={<Stepper label={t('height')} value={value.heightCm} unit="cm" step={1} min={130} max={210} onChange={(v) => set('heightCm', v)} />} />
        <Row last label={t('weight')} right={<Stepper label={t('weight')} value={value.weightKg} unit="kg" step={0.5} min={35} max={200} onChange={(v) => set('weightKg', v)} />} />
      </Group>
    </View>
  );
}

export function GoalFields({ value, onChange }: { value: Goal; onChange: (g: Goal) => void }) {
  const { t } = useStore();
  const hint = { lose: t('goalLoseHint'), maintain: t('goalMaintainHint'), learn: t('goalLearnHint') }[value];
  return (
    <View>
      <Segmented<Goal>
        options={[
          { value: 'lose', label: t('goalLose') },
          { value: 'maintain', label: t('goalMaintain') },
          { value: 'learn', label: t('goalLearn') },
        ]}
        value={value}
        onChange={onChange}
      />
      <T kind="caption" center style={{ marginTop: 10 }}>
        {hint}
      </T>
    </View>
  );
}

export const defaultProfile: Profile = { sex: 'f', age: 30, heightCm: 160, weightKg: 60, goal: 'lose' };
