import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { Pig } from '@/components/art';
import { Btn, Card, Gap, Screen, T } from '@/components/ui';
import { validateKey } from '@/lib/gemini';
import { useStore } from '@/lib/store';
import { font, useTheme } from '@/lib/theme';

const STUDIO = 'https://aistudio.google.com/app/apikey';

export default function ConnectAi() {
  const { t, state, update } = useStore();
  const c = useTheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [manual, setManual] = useState('');

  const tryKey = async (raw: string) => {
    const key = raw.trim();
    if (!key) return;
    setBusy(true);
    setError(false);
    const ok = await validateKey(key);
    setBusy(false);
    if (!ok) return setError(true);
    update((s) => ({ ...s, apiKey: key }));
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const paste = async () => {
    try {
      tryKey(await Clipboard.getStringAsync());
    } catch {
      setError(true);
    }
  };

  const open = () => {
    if (Platform.OS === 'web') window.open(STUDIO, '_blank');
    else WebBrowser.openBrowserAsync(STUDIO);
  };

  const steps = [t('aiStep1'), t('aiStep2'), t('aiStep3')];

  return (
    <Screen>
      <View style={{ alignItems: 'center' }}>
        <Pig size={88} mood="calm" />
      </View>
      <Gap h={8} />
      <T kind="display" center>
        {t('aiTitle')}
      </T>
      <Gap h={8} />
      <T kind="sub" center>
        {t('aiIntro')}
      </T>
      <Gap h={20} />

      {state.apiKey ? (
        <Card style={{ backgroundColor: c.goodSoft, borderColor: c.goodSoft }}>
          <T kind="title" color={c.good}>
            ✓ {t('aiConnected')}
          </T>
        </Card>
      ) : null}
      <Gap />

      <Card>
        {steps.map((s, i) => (
          <View key={i} style={styles.step}>
            <View style={[styles.num, { backgroundColor: c.primarySoft }]}>
              <T kind="sub" color={c.primary} style={{ fontWeight: '700' }}>
                {i + 1}
              </T>
            </View>
            <T kind="body" style={{ flex: 1 }}>
              {s}
            </T>
          </View>
        ))}
      </Card>
      <Gap h={16} />
      <Btn kind="soft" label={t('openStudio')} onPress={open} />
      <Gap h={10} />
      <Btn label={busy ? t('checking') : t('pasteKey')} loading={busy} onPress={paste} />
      {error ? (
        <>
          <Gap h={8} />
          <T kind="sub" color={c.warn} center>
            {t('aiBad')}
          </T>
        </>
      ) : null}
      <Gap h={14} />
      <TextInput
        value={manual}
        onChangeText={setManual}
        onSubmitEditing={() => tryKey(manual)}
        onBlur={() => manual && tryKey(manual)}
        placeholder={t('pasteHere')}
        placeholderTextColor={c.sub}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        style={[styles.input, { borderColor: c.line, color: c.text, backgroundColor: c.card, fontFamily: Platform.OS === 'web' ? font : undefined }]}
      />
      <Gap h={18} />
      <Card style={{ backgroundColor: c.goodSoft, borderColor: c.goodSoft }}>
        <T kind="sub" color={c.text}>
          {t('aiNoCard')}
        </T>
      </Card>
      <Gap h={10} />
      <T kind="sub">{t('aiPrivacy')}</T>

      {state.apiKey ? (
        <>
          <Gap h={20} />
          <Btn kind="danger" label={t('aiDisconnect')} onPress={() => update((s) => ({ ...s, apiKey: null }))} />
        </>
      ) : null}
      <Gap h={8} />
      <Btn kind="ghost" label={t('back')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 6 },
  num: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
});
