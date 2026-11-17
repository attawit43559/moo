import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Pig } from '@/components/art';
import { Btn, Card, Gap, Screen, T } from '@/components/ui';
import { todayKey } from '@/lib/energy';
import { KeyError, QuotaError, readSteps } from '@/lib/gemini';
import { fmt } from '@/lib/i18n';
import { pickImage } from '@/lib/image';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

function shortcutLink(): string {
  if (Platform.OS !== 'web') return 'moo://steps?n=';
  const { origin, pathname } = window.location;
  const base = pathname.replace(/\/steps\/?$/, '').replace(/\/$/, '');
  return `${origin}${base}/steps?n=`;
}

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
    const n = Math.round(Number(String(params.n).replace(/[^\d.]/g, '')));
    if (Number.isFinite(n) && n >= 0) {
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
    await Clipboard.setStringAsync(shortcutLink());
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
      <Gap h={4} />
      <T kind="sub">{t('stepsIntro')}</T>
      <Gap h={18} />

      <Pressable onPress={() => setShowShortcut(!showShortcut)}>
        <Card>
          <T kind="title">{t('viaShortcut')}</T>
          <T kind="sub">{t('viaShortcutHint')}</T>
        </Card>
      </Pressable>
      {showShortcut && (
        <>
          <Gap h={8} />
          <Card style={{ backgroundColor: c.primarySoft, borderColor: c.primarySoft }}>
            <T kind="title">{t('shortcutTitle')}</T>
            <Gap h={8} />
            <T kind="body">{t('shortcutSteps')}</T>
            <Gap h={12} />
            <T kind="sub" style={{ fontFamily: Platform.OS === 'web' ? 'ui-monospace, monospace' : undefined }}>
              {shortcutLink()}
            </T>
            <Gap h={10} />
            <Btn kind="primary" label={copied ? t('copied') : t('copyLink')} onPress={copy} />
          </Card>
        </>
      )}

      <Gap h={12} />
      <Pressable onPress={fromScreenshot} disabled={reading}>
        <Card>
          <T kind="title">{t('viaScreenshot')}</T>
          <T kind="sub">{t('viaScreenshotHint')}</T>
        </Card>
      </Pressable>

      {reading && (
        <View style={styles.center}>
          <ActivityIndicator color={c.primary} />
          <Gap h={6} />
          <T kind="sub">{t('readingSteps')}</T>
        </View>
      )}
      {error && (
        <>
          <Gap />
          <T kind="body" color={c.warn} center>
            {error}
          </T>
        </>
      )}
      {found != null && (
        <>
          <Gap h={16} />
          <Card style={{ alignItems: 'center' }}>
            <T kind="title" center>
              {t('stepsFound', { n: fmt(found, lang) })}
            </T>
            <Gap />
            <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch' }}>
              <Btn label={t('save')} onPress={confirm} style={{ flex: 1 }} />
              <Btn kind="soft" label={t('retry')} onPress={fromScreenshot} style={{ flex: 1 }} />
            </View>
          </Card>
        </>
      )}

      <Gap h={20} />
      <Btn kind="ghost" label={t('back')} onPress={close} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingVertical: 32 },
});
