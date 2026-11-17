import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, View } from 'react-native';

import { Pig } from '@/components/art';
import { Btn, Gap, Group, Row, Screen, Sticker, T } from '@/components/ui';
import { todayKey } from '@/lib/energy';
import { KeyError, QuotaError, readSteps } from '@/lib/gemini';
import { parseSteps, SHORTCUT_ICLOUD, stepsReturnUrl } from '@/lib/health';
import { fmt } from '@/lib/i18n';
import { pickImage } from '@/lib/image';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

export default function Steps() {
  const { t, state, setSteps, bumpAi } = useStore();
  const c = useTheme();
  const params = useLocalSearchParams<{ n?: string }>();
  const [saved, setSaved] = useState<number | null>(null);
  const [reading, setReading] = useState(false);
  const [found, setFound] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showShortcut, setShowShortcut] = useState(false);
  const [copied, setCopied] = useState(false);
  const lang = state.lang;

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  // Arriving from the iPhone Shortcut: /steps?n=8421
  useEffect(() => {
    if (params.n == null || !state.profile) return;
    const n = parseSteps(params.n);
    if (n != null) {
      setSteps(todayKey(), n, 'shortcut');
      setSaved(n);
      router.replace('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.n, state.profile]);

  const fromScreenshot = async () => {
    if (!state.apiKey) return router.push('/connect-ai');
    setError(null);
    setFound(null);
    const p = await pickImage('library');
    if (!p) return;
    setReading(true);
    try {
      bumpAi();
      const n = await readSteps(state.apiKey, p.base64);
      if (n == null) setError(t('stepsNotFound'));
      else setFound(n);
    } catch (e) {
      setError(e instanceof QuotaError ? t('aiQuota') : e instanceof KeyError ? t('aiBad') : t('aiError'));
    } finally {
      setReading(false);
    }
  };

  const confirm = () => {
    if (found == null) return;
    setSteps(todayKey(), found, 'screenshot');
    close();
  };

  const copy = async () => {
    await Clipboard.setStringAsync(stepsReturnUrl());
    setCopied(true);
  };

  if (saved != null) {
    return (
      <Screen>
        <View style={styles.center}>
          <Pig size={120} mood="proud" />
          <Gap />
          <T kind="display" center>
            {t('stepsSaved', { n: fmt(saved, lang) })}
          </T>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <T kind="display">{t('stepsTitle')}</T>
      <Gap h={8} />
      <T kind="sub">{t('stepsIntro')}</T>
      <Gap h={28} />

      <Group>
        <Row label={t('viaShortcut')} sub={t('viaShortcutHint')} onPress={() => (SHORTCUT_ICLOUD ? Linking.openURL(SHORTCUT_ICLOUD) : setShowShortcut(!showShortcut))} last={false} />
        {showShortcut ? (
          <View style={{ paddingBottom: 16 }}>
            <T kind="sub" color={c.text}>
              {t('shortcutSteps')}
            </T>
            <Gap h={12} />
            <View style={[styles.code, { backgroundColor: c.bg, borderColor: c.line }]}>
              <T kind="caption" style={{ fontFamily: Platform.OS === 'web' ? 'ui-monospace, monospace' : undefined }}>
                {stepsReturnUrl()}
              </T>
            </View>
            <Gap h={10} />
            <Btn kind="quiet" label={copied ? t('copied') : t('copyLink')} onPress={copy} />
          </View>
        ) : null}
        <Row label={t('viaScreenshot')} sub={t('viaScreenshotHint')} onPress={fromScreenshot} last />
      </Group>

      {reading && (
        <View style={styles.center}>
          <ActivityIndicator color={c.ink} />
          <Gap h={8} />
          <T kind="sub">{t('readingSteps')}</T>
        </View>
      )}
      {error && (
        <T kind="sub" color={c.warn} center>
          {error}
        </T>
      )}
      {found != null && (
        <Sticker color={c.lime} style={{ alignItems: 'center', paddingVertical: 20 }}>
          <T kind="hero">{fmt(found, lang)}</T>
          <T kind="body" weight="500">
            {t('stepsUnit')} · {t('isThisRight')}
          </T>
          <Gap h={18} />
          <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch' }}>
            <Btn kind="quiet" label={t('retry')} onPress={fromScreenshot} style={{ flex: 1 }} />
            <Btn label={t('save')} onPress={confirm} style={{ flex: 2 }} />
          </View>
        </Sticker>
      )}

      <Gap h={12} />
      <Btn kind="ghost" label={t('back')} onPress={close} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingVertical: 28 },
  code: { borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', padding: 12 },
});
