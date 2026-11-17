import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { Btn, Gap, Screen, T } from '@/components/ui';
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

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const tryKey = async (raw: string) => {
    const key = raw.trim();
    if (!key) return;
    setBusy(true);
    setError(false);
    const ok = await validateKey(key);
    setBusy(false);
    if (!ok) return setError(true);
    update((s) => ({ ...s, apiKey: key }));
    close();
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

  return (
    <Screen
      footer={
        <View style={{ gap: 10 }}>
          <Btn kind="quiet" label={t('openStudio')} onPress={open} />
          <Btn label={busy ? t('checking') : t('pasteKey')} loading={busy} onPress={paste} />
        </View>
      }>
      <T kind="display">{t('aiTitle')}</T>
      <Gap h={10} />
      <T kind="sub">{t('aiIntro')}</T>

      {state.apiKey ? (
        <View style={[styles.status, { backgroundColor: c.goodSoft }]}>
          <View style={[styles.dot, { backgroundColor: c.good }]} />
          <T kind="body" weight="600" color={c.good}>
            {t('aiConnected')}
          </T>
        </View>
      ) : null}

      <Gap h={32} />
      {[t('aiStep1'), t('aiStep2'), t('aiStep3')].map((s, i) => (
        <View key={i} style={styles.step}>
          <T kind="title" color={c.sub} style={{ width: 24 }}>
            {i + 1}
          </T>
          <T kind="body" style={{ flex: 1 }}>
            {s}
          </T>
        </View>
      ))}

      <Gap h={20} />
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
        style={[styles.input, { color: c.text, backgroundColor: c.fill, fontFamily: Platform.OS === 'web' ? font : undefined }]}
      />
      {error ? (
        <>
          <Gap h={8} />
          <T kind="caption" color={c.warn}>
            {t('aiBad')}
          </T>
        </>
      ) : null}

      <Gap h={28} />
      <T kind="caption">{t('aiNoCard')}</T>
      <Gap h={8} />
      <T kind="caption">{t('aiPrivacy')}</T>
      {state.apiKey ? (
        <>
          <Gap h={16} />
          <Btn kind="danger" label={t('aiDisconnect')} onPress={() => update((s) => ({ ...s, apiKey: null }))} />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  status: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, marginTop: 16 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  step: { flexDirection: 'row', gap: 12, paddingVertical: 8 },
  input: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
});
