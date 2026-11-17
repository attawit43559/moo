import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StoreProvider } from '@/lib/store';
import { useTheme } from '@/lib/theme';

function Nav() {
  const c = useTheme();
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="connect-ai" options={{ presentation: 'modal' }} />
        <Stack.Screen name="food" options={{ presentation: 'modal' }} />
        <Stack.Screen name="steps" options={{ presentation: 'modal' }} />
        <Stack.Screen name="bill" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Nav />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
