import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Pig } from '@/components/art';
import { defaultProfile, GoalFields, LangSwitch, ProfileFields } from '@/components/profile';
import { Btn, Gap, Screen, T } from '@/components/ui';
import { Profile } from '@/lib/energy';
import { useStore } from '@/lib/store';
import { BORDER, shadow, useTheme } from '@/lib/theme';

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
          <View key={i} style={[styles.dot, { borderColor: c.ink, backgroundColor: i <= step ? c.ink : c.line, width: i === step ? 28 : 8 }]} />
        ))}
      </View>

      {step === 0 && (
        <View style={styles.center}>
          <View style={[styles.blob, { backgroundColor: c.lime, borderColor: c.ink }, shadow(5)]}>
            <Pig size={130} />
          </View>
          <Gap h={14} />
          <View style={[styles.tagline, { backgroundColor: c.ink }]}>
            <T kind="caption" color={c.bg} weight="500">
              {t('appTagline')}
            </T>
          </View>
          <Gap h={22} />
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
  center: { alignItems: 'center', paddingTop: 28 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  dot: { height: 8, borderRadius: 4 },
  blob: { width: 190, height: 190, borderRadius: 95, borderWidth: BORDER, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-3deg' }] },
  tagline: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, transform: [{ rotate: '1deg' }] },
});
