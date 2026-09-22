import { useEffect } from 'react';
import { View, type DimensionValue } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useExperience } from '@/providers/ExperienceProvider';
export function Skeleton({
  height = 20,
  width = '100%',
}: {
  height?: number;
  width?: DimensionValue;
}) {
  const { colors: c, reducedMotion } = useExperience();
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = reducedMotion ? 1 : withRepeat(withTiming(0.5, { duration: 900 }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity, reducedMotion]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      accessible={false}
      style={[{ height, width, backgroundColor: c.border.subtle, borderRadius: 12 }, style]}
    />
  );
}
export function OutfitSkeleton() {
  return (
    <View
      accessibilityLabel="Opening your wardrobe"
      accessibilityState={{ busy: true }}
      style={{ gap: 20, paddingTop: 24 }}
    >
      <Skeleton height={360} />
      <Skeleton width="65%" height={38} />
      <Skeleton width="85%" />
      <Skeleton height={52} />
    </View>
  );
}
