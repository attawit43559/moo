import { router, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useStore } from '@/lib/store';
import { font, useTheme } from '@/lib/theme';

function Icon({ d, color }: { d: string; color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d={d} />
    </Svg>
  );
}

const ICONS = {
  today: 'M12 3a9 9 0 1 0 9 9M12 7v5l3 2',
  history: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  settings: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M16 4v4M10 10v4M18 16v4',
};

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
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.sub,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.line, height: Platform.OS === 'web' ? 64 : undefined },
        tabBarLabelStyle: { fontFamily: Platform.OS === 'web' ? font : undefined, fontSize: 12, fontWeight: '600' },
        sceneStyle: { backgroundColor: c.bg },
      }}>
      <Tabs.Screen name="index" options={{ title: t('tabToday'), tabBarIcon: ({ color }) => <Icon d={ICONS.today} color={String(color)} /> }} />
      <Tabs.Screen name="history" options={{ title: t('tabHistory'), tabBarIcon: ({ color }) => <Icon d={ICONS.history} color={String(color)} /> }} />
      <Tabs.Screen name="settings" options={{ title: t('tabSettings'), tabBarIcon: ({ color }) => <Icon d={ICONS.settings} color={String(color)} /> }} />
    </Tabs>
  );
}
