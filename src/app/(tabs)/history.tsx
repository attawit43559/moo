import { StyleSheet, View } from 'react-native';

import { Gap, Screen, T } from '@/components/ui';
import { summarize, todayKey } from '@/lib/energy';
import { fmt } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

export default function History() {
  const { t, state } = useStore();
  const c = useTheme();
  const lang = state.lang;
  const loc = lang === 'th' ? 'th-TH' : 'en-US';
  const profile = state.profile!;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = todayKey(d);
    const intake = state.meals.filter((m) => m.date === key).reduce((a, m) => a + m.kcal, 0);
    const steps = state.steps[key]?.count ?? 0;
    const s = summarize(profile, intake, steps);
    return { d, key, intake, steps, s, hasData: intake > 0 || steps > 0 };
  });
  const withData = days.filter((x) => x.hasData);
  const avg = withData.length ? withData.reduce((a, x) => a + x.s.balance, 0) / withData.length : 0;
  const maxAbs = Math.max(300, ...withData.map((x) => Math.abs(x.s.balance)));
  const H = 64;

  return (
    <Screen>
      <T kind="display">{t('historyTitle')}</T>
      <Gap h={24} />
      <T kind="caption">
        {t('net')} · kcal/{lang === 'th' ? 'วัน' : 'day'}
      </T>
      <T kind="hero" color={withData.length ? (avg <= 0 ? c.good : c.warn) : c.sub}>
        {withData.length ? (avg > 0 ? '+' : '−') + fmt(Math.abs(avg), lang) : '—'}
      </T>

      <Gap h={24} />
      <View style={[styles.chart, { height: H * 2 + 28 }]}>
        <View style={[styles.zero, { top: H, backgroundColor: c.line }]} />
        {days.map((x) => {
          const h = x.hasData ? Math.max(4, (Math.abs(x.s.balance) / maxAbs) * H) : 0;
          const pos = x.s.balance > 0;
          return (
            <View key={x.key} style={styles.col}>
              <View style={{ height: H * 2, width: '100%', alignItems: 'center' }}>
                {x.hasData ? (
                  <View style={{ position: 'absolute', width: 14, height: h, borderRadius: 7, backgroundColor: pos ? c.warn : c.good, top: pos ? H - h : H }} />
                ) : (
                  <View style={{ position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: c.line, top: H - 2 }} />
                )}
              </View>
              <T kind="caption">{x.d.toLocaleDateString(loc, { weekday: 'narrow' })}</T>
            </View>
          );
        })}
      </View>

      <Gap h={28} />
      {days
        .slice()
        .reverse()
        .map((x, i) => (
          <View key={x.key} style={[styles.row, i < 6 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line }]}>
            <View style={{ flex: 1 }}>
              <T kind="body" weight="500">
                {x.d.toLocaleDateString(loc, { weekday: 'short', day: 'numeric', month: 'short' })}
              </T>
              <T kind="caption">
                {fmt(x.intake, lang)} kcal · {fmt(x.steps, lang)} {t('stepsUnit')}
              </T>
            </View>
            <T kind="body" weight="600" color={!x.hasData ? c.sub : x.s.balance <= 0 ? c.good : c.warn}>
              {x.hasData ? (x.s.balance > 0 ? '+' : '−') + fmt(Math.abs(x.s.balance), lang) : '—'}
            </T>
          </View>
        ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row' },
  zero: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth },
  col: { flex: 1, alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
});
