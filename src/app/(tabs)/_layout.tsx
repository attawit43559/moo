import type { BottomTabBarProps } from 'expo-router/tabs';
import { router, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useSnap } from '@/lib/snap';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

function Icon({ d, color, size = 24 }: { d: string; color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <Path d={d} />
    </Svg>
  );
}

const ICONS: Record<string, string> = {
  index: 'M3 11l9-7 9 7v9h-6v-6H9v6H3z',
  history: 'M5 20V12M12 20V5M19 20v-9',
  settings: 'M4 7h10M18 7h2M16 5v4M4 17h4M12 17h8M10 15v4',
};
const CAMERA = 'M4 8.5h2.6l1.6-2.5h7.6l1.6 2.5H20v10.5H4zM12 16.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z';

const BILL = 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6';

/** Quiet icon row with the camera as a raised plate in the middle. */
function PillBar({ state, descriptors, navigateToTab }: BottomTabBarProps) {
  const c = useTheme();
  const { t } = useStore();
  const { busy, snap } = useSnap();
  const insets = useSafeAreaInsets();
  const Item = ({ d, label, on, onPress }: { d: string; label: string; on?: boolean; onPress: () => void }) => (
    <Pressable accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: !!on }} onPress={onPress} style={styles.tab}>
      <Icon d={d} color={on ? c.ink : '#A3A6AD'} />
      <View style={[styles.dot, { backgroundColor: on ? c.ink : 'transparent' }]} />
    </Pressable>
  );
  const tab = (i: number) => {
    const route = state.routes[i];
    const on = state.index === i;
    const label = descriptors[route.key].options.tabBarAccessibilityLabel ?? route.name;
    return <Item key={route.key} d={ICONS[route.name] ?? ICONS.index} label={label} on={on} onPress={() => !on && navigateToTab(route.key)} />;
  };
  return (
    <View style={[styles.bar, { backgroundColor: c.bg, paddingBottom: Math.max(insets.bottom, 12), borderTopColor: c.line }]}>
      {tab(0)}
      {tab(1)}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('snapMeal')}
        onPress={() => snap('camera')}
        style={({ pressed }) => [styles.cam, { backgroundColor: c.ink, transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
        {busy === 'camera' ? <ActivityIndicator color={c.onPrimary} /> : <Icon d={CAMERA} color={c.lime} size={28} />}
      </Pressable>
      <Item d={BILL} label={t('seeBill')} onPress={() => router.push('/bill')} />
      {tab(2)}
    </View>
  );
}

export default function TabsLayout() {
  const { ready, state, t } = useStore();
  const c = useTheme();
  const needsOnboarding = ready && !state.profile;
  useEffect(() => {
    if (needsOnboarding) router.replace('/onboarding');
  }, [needsOnboarding]);
  if (!ready || !state.profile) return <View style={{ flex: 1, backgroundColor: c.bg }} />;

  return (
    <Tabs
      tabBar={(p) => <PillBar {...p} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }}>
      <Tabs.Screen name="index" options={{ title: t('tabToday'), tabBarAccessibilityLabel: t('tabToday') }} />
      <Tabs.Screen name="history" options={{ title: t('tabHistory'), tabBarAccessibilityLabel: t('tabHistory') }} />
      <Tabs.Screen name="settings" options={{ title: t('tabSettings'), tabBarAccessibilityLabel: t('tabSettings') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingTop: 8, borderTopWidth: 1 },
  tab: { width: 52, height: 48, alignItems: 'center', justifyContent: 'center', gap: 5 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  cam: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginTop: -26 },
});
