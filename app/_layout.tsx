import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ExperienceProvider, useExperience } from '@/providers/ExperienceProvider';
import { CollectionProvider } from '@/providers/CollectionProvider';
import { SessionProvider, useSession } from '@/providers/SessionProvider';
import { StyleProfileProvider } from '@/providers/StyleProfileProvider';
import { WardrobeProvider } from '@/providers/WardrobeProvider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ExperienceProvider>
        <SessionProvider>
          <AccountData />
        </SessionProvider>
      </ExperienceProvider>
    </GestureHandlerRootView>
  );
}
function AccountData() {
  const { session, isDemo } = useSession();
  return (
    <StyleProfileProvider key={isDemo ? 'demo' : (session?.user.id ?? 'guest')}>
      <WardrobeProvider>
        <CollectionProvider>
          <Navigation />
        </CollectionProvider>
      </WardrobeProvider>
    </StyleProfileProvider>
  );
}
function Navigation() {
  const { session, isDemo } = useSession();
  const { colors: c, dark, reducedMotion } = useExperience();
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.canvas.default },
          headerShadowVisible: false,
          headerTintColor: c.ink.primary,
          contentStyle: { backgroundColor: c.canvas.default },
          animation: reducedMotion ? 'none' : 'fade_from_bottom',
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Protected guard={isDemo || Boolean(session)}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="garment/add"
            options={{ title: 'A new piece', presentation: 'modal' }}
          />
          <Stack.Screen name="garment/[id]" options={{ title: 'Your wardrobe' }} />
          <Stack.Screen
            name="garment/edit/[id]"
            options={{ title: 'The details', presentation: 'modal' }}
          />
          <Stack.Screen name="look/[id]" options={{ title: 'Saved look' }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
