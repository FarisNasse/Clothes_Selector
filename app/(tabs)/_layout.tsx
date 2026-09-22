import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { FloatingTabBar } from '@/components/navigation/FloatingTabBar';
const renderTabBar: NonNullable<ComponentProps<typeof Tabs>['tabBar']> = (props) => (
  <FloatingTabBar {...props} />
);
export default function TabLayout() {
  return (
    <Tabs tabBar={renderTabBar} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="wardrobe" options={{ title: 'Wardrobe' }} />
      <Tabs.Screen name="style" options={{ title: 'Style' }} />
      <Tabs.Screen name="profile" options={{ title: 'You' }} />
    </Tabs>
  );
}
