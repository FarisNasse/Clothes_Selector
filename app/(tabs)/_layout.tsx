import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { semanticColors } from '@/design/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: semanticColors.accent.forestDeep,
        tabBarInactiveTintColor: semanticColors.ink.tertiary,
        tabBarStyle: {
          backgroundColor: semanticColors.canvas.elevated,
          borderTopColor: semanticColors.border.subtle,
          height: 82,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarItemStyle: { paddingVertical: 3 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: 'Wardrobe',
          tabBarIcon: ({ color, size }) => <Ionicons name="shirt-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="style"
        options={{
          title: 'Style',
          tabBarIcon: ({ color, size }) => <Ionicons name="layers-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'You',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
