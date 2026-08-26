import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SessionProvider } from '@/providers/SessionProvider';
import { StyleProfileProvider } from '@/providers/StyleProfileProvider';
import { WardrobeProvider } from '@/providers/WardrobeProvider';
import { colors } from '@/theme/tokens';

export default function RootLayout() {
  return (
    <SessionProvider>
      <StyleProfileProvider>
        <WardrobeProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
            headerTintColor: colors.ink,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="garment/add" options={{ title: 'Add garment', presentation: 'modal' }} />
          <Stack.Screen name="garment/[id]" options={{ title: 'Garment' }} />
          <Stack.Screen name="garment/edit/[id]" options={{ title: 'Edit garment', presentation: 'modal' }} />
        </Stack>
        </WardrobeProvider>
      </StyleProfileProvider>
    </SessionProvider>
  );
}
