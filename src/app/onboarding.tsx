import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Pig } from '@/components/art';
import { defaultProfile, GoalFields, LangSwitch, ProfileFields } from '@/components/profile';
import { Btn, Gap, Screen, T } from '@/components/ui';
import { Profile } from '@/lib/energy';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

export default function Onboarding() {
  const { t, update } = useStore();
  const c = useTheme();
  const [step, setStep] = useState(0);
  const [p, setP] = useState<Profile>(defaultProfile);

  const finish = () => {
    update((s) => ({ ...s, profile: p }));
    router.replace('/');
  };

  return (
    <Screen>
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i <= step ? c.primary : c.line }]} />
        ))}
      </View>

      {step === 0 && (
        <View style={styles.center}>
          <Pig size={140} />
          <Gap h={20} />
          <T kind="display" center>
            {t('welcomeTitle')}
          </T>
          <Gap h={8} />
          <T kind="body" color={c.sub} center>
            {t('welcomeBody')}
          </T>
          <Gap h={28} />
          <LangSwitch />
        </View>
      )}

      {step === 1 && (
        <View>
          <T kind="display">{t('aboutYou')}</T>
          <T kind="sub">{t('aboutYouHint')}</T>
          <Gap h={16} />
          <ProfileFields value={p} onChange={setP} />
        </View>
      )}

      {step === 2 && (
        <View>
          <T kind="display">{t('goalTitle')}</T>
          <Gap h={16} />
          <GoalFields value={p.goal} onChange={(goal) => setP({ ...p, goal })} />
          <Gap h={20} />
          <T kind="sub">{t('disclaimer')}</T>
        </View>
      )}

      <Gap h={28} />
      <Btn label={step < 2 ? t('next') : t('start')} onPress={() => (step < 2 ? setStep(step + 1) : finish())} />
      {step > 0 && (
        <>
          <Gap h={8} />
          <Btn kind="ghost" label={t('back')} onPress={() => setStep(step - 1)} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  center: { alignItems: 'center', paddingTop: 24 },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 20 },
  dot: { width: 28, height: 5, borderRadius: 3 },
});
