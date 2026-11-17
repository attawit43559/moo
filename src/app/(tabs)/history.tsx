import { StyleSheet, View } from 'react-native';

import { Card, Gap, Screen, T } from '@/components/ui';
import { summarize, todayKey } from '@/lib/energy';
import { fmt } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

export default function History() {
  const { t, state } = useStore();
  const c = useTheme();
  const lang = state.lang;
  const profile = state.profile!;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = todayKey(d);
    const intake = state.meals.filter((m) => m.date === key).reduce((a, m) => a + m.kcal, 0);
    const steps = state.steps[key]?.count ?? 0;
    const s = summarize(profile, intake, steps);
    const hasData = intake > 0 || steps > 0;
    return { d, key, intake, steps, s, hasData };
  });

  const maxAbs = Math.max(300, ...days.filter((x) => x.hasData).map((x) => Math.abs(x.s.balance)));
  const H = 70; // half chart height in px

  return (
    <Screen>
      <T kind="display">{t('historyTitle')}</T>
      <Gap h={4} />
      <T kind="sub">{t('balance')} (kcal)</T>
      <Gap h={12} />
      <Card>
        <View style={[styles.chart, { height: H * 2 + 24 }]}>
          <View style={[styles.zero, { top: H, backgroundColor: c.line }]} />
          {days.map((x) => {
            const h = x.hasData ? (Math.abs(x.s.balance) / maxAbs) * H : 0;
            const pos = x.s.balance > 0;
            return (
              <View key={x.key} style={styles.col}>
                <View style={{ height: H * 2, justifyContent: 'center', width: '100%', alignItems: 'center' }}>
                  <View
                    style={{
                      position: 'absolute',
                      width: '60%',
                      height: Math.max(h, x.hasData ? 3 : 0),
                      borderRadius: 6,
                      backgroundColor: pos ? c.warn : c.good,
                      top: pos ? H - h : H,
                    }}
                  />
                </View>
                <T kind="sub" style={{ fontSize: 12 }}>
                  {x.d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { weekday: 'narrow' })}
                </T>
              </View>
            );
          })}
        </View>
      </Card>

      <Gap h={16} />
      <View style={{ gap: 10 }}>
        {days
          .slice()
          .reverse()
          .map((x) => (
            <Card key={x.key} style={styles.dayRow}>
              <View style={{ flex: 1 }}>
                <T kind="body" style={{ fontWeight: '600' }}>
                  {x.d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                </T>
                <T kind="sub">
                  {fmt(x.intake, lang)} kcal · {fmt(x.steps, lang)} / {fmt(x.s.stepGoal, lang)}
                </T>
              </View>
              {x.hasData ? (
                <T kind="body" color={x.s.balance <= 0 ? c.good : c.warn} style={{ fontWeight: '700' }}>
                  {x.s.balance > 0 ? '+' : '−'}
                  {fmt(Math.abs(x.s.balance), lang)}
                </T>
              ) : (
                <T kind="sub">—</T>
              )}
            </Card>
          ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', alignItems: 'flex-start' },
  zero: { position: 'absolute', left: 0, right: 0, height: 1 },
  col: { flex: 1, alignItems: 'center' },
  dayRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
});
