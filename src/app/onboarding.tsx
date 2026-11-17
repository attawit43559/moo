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
    <Screen
      footer={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {step > 0 ? <Btn kind="quiet" label={t('back')} onPress={() => setStep(step - 1)} style={{ flex: 1 }} /> : null}
          <Btn label={step < 2 ? t('next') : t('start')} onPress={() => (step < 2 ? setStep(step + 1) : finish())} style={{ flex: 2 }} />
        </View>
      }>
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i <= step ? c.text : c.line, width: i === step ? 20 : 6 }]} />
        ))}
      </View>

      {step === 0 && (
        <View style={styles.center}>
          <Pig size={120} />
          <Gap h={28} />
          <T kind="display" center>
            {t('welcomeTitle')}
          </T>
          <Gap h={10} />
          <T kind="sub" center style={{ maxWidth: 300 }}>
            {t('welcomeBody')}
          </T>
          <Gap h={40} />
          <View style={{ alignSelf: 'stretch' }}>
            <LangSwitch />
          </View>
        </View>
      )}

      {step === 1 && (
        <View>
          <T kind="display">{t('aboutYou')}</T>
          <Gap h={6} />
          <T kind="sub">{t('aboutYouHint')}</T>
          <Gap h={28} />
          <ProfileFields value={p} onChange={setP} />
        </View>
      )}

      {step === 2 && (
        <View>
          <T kind="display">{t('goalTitle')}</T>
          <Gap h={28} />
          <GoalFields value={p.goal} onChange={(goal) => setP({ ...p, goal })} />
          <Gap h={40} />
          <T kind="caption" center>
            {t('disclaimer')}
          </T>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingTop: 48 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 28 },
  dot: { height: 6, borderRadius: 3 },
});
