import { useEffect, useState } from 'react';
import { Keyboard, Platform, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { Tabs } from 'expo-router';
type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/primitives/AppText';
import { AnimatedPressable } from '@/components/motion/AnimatedPressable';
import { useExperience } from '@/providers/ExperienceProvider';
const icons: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  index: ['sparkles-outline', 'sparkles'],
  wardrobe: ['shirt-outline', 'shirt'],
  style: ['layers-outline', 'layers'],
  profile: ['person-outline', 'person'],
};
export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors: c } = useExperience();
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [keyboard, setKeyboard] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboard(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboard(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  if (keyboard && Platform.OS !== 'web') return null;
  return (
    <View
      style={{
        backgroundColor: c.canvas.default,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 12),
      }}
    >
      <View
        accessibilityRole="tablist"
        style={{
          width: '100%',
          maxWidth: 620,
          alignSelf: 'center',
          backgroundColor: c.canvas.elevated,
          borderWidth: 1,
          borderColor: c.border.subtle,
          borderRadius: 32,
          padding: 7,
          flexDirection: 'row',
          gap: 4,
        }}
      >
        {state.routes.map((route, index) => {
          const active = index === state.index;
          const label = descriptors[route.key]?.options.title ?? route.name;
          const icon = icons[route.name]?.[active ? 1 : 0] ?? 'ellipse-outline';
          return (
            <AnimatedPressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: active }}
              feedback
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!active && !event.defaultPrevented)
                  navigation.navigate(route.name, route.params);
              }}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              style={{
                flex: 1,
                minHeight: 54,
                borderRadius: 26,
                paddingVertical: 8,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                flexDirection: width > 700 && fontScale < 1.4 ? 'row' : 'column',
                backgroundColor: active ? c.accent.forestMist : 'transparent',
              }}
            >
              <Ionicons name={icon} color={active ? c.accent.forest : c.ink.secondary} size={20} />
              <AppText
                variant="micro"
                style={{
                  color: active ? c.accent.forest : c.ink.secondary,
                  fontWeight: active ? '700' : '500',
                  paddingHorizontal: 3,
                }}
              >
                {label}
              </AppText>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}
