import { router, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

function Icon({ d, color }: { d: string; color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d={d} />
    </Svg>
  );
}

const ICONS = {
  today: 'M3 11l9-7 9 7v9h-6v-6H9v6H3z',
  history: 'M5 20V12M12 20V5M19 20v-9',
  settings: 'M4 7h10M18 7h2M16 5v4M4 17h4M12 17h8M10 15v4',
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
        tabBarInactiveTintColor: c.sub,
        tabBarShowLabel: false,
        tabBarActiveTintColor: c.text,
        tabBarStyle: { backgroundColor: c.bg, borderTopWidth: 0, elevation: 0, height: Platform.OS === 'web' ? 60 : undefined },
        sceneStyle: { backgroundColor: c.bg },
      }}>
      <Tabs.Screen name="index" options={{ title: t('tabToday'), tabBarAccessibilityLabel: t('tabToday'), tabBarIcon: ({ color }) => <Icon d={ICONS.today} color={String(color)} /> }} />
      <Tabs.Screen name="history" options={{ title: t('tabHistory'), tabBarAccessibilityLabel: t('tabHistory'), tabBarIcon: ({ color }) => <Icon d={ICONS.history} color={String(color)} /> }} />
      <Tabs.Screen name="settings" options={{ title: t('tabSettings'), tabBarAccessibilityLabel: t('tabSettings'), tabBarIcon: ({ color }) => <Icon d={ICONS.settings} color={String(color)} /> }} />
    </Tabs>
  );
}
