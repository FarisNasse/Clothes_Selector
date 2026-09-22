import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from './AppText';
import { AnimatedPressable } from '@/components/motion/AnimatedPressable';
import { useExperience } from '@/providers/ExperienceProvider';
import { motion } from '@/design/motion';
import { radius } from '@/design/radii';
type Props = {
  label: string;
  selected?: boolean;
  onPress?: (() => void) | undefined;
  accessibilityLabel?: string;
};
export function Chip({ label, selected = false, onPress, accessibilityLabel }: Props) {
  const { colors: c, reducedMotion } = useExperience();
  const progress = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: reducedMotion ? 0 : motion.fast });
  }, [selected, reducedMotion, progress]);
  const background = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [c.canvas.elevated, c.accent.forestDeep],
    ),
  }));
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !onPress }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      disabled={!onPress}
      feedback
      style={{ borderRadius: radius.pill }}
    >
      <Animated.View
        style={[
          {
            minHeight: 44,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: radius.pill,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          },
          background,
        ]}
      >
        {selected ? <Ionicons name="checkmark" size={13} color={c.ink.inverse} /> : null}
        <AppText
          variant="bodySmall"
          style={{
            color: selected ? c.ink.inverse : c.ink.secondary,
            textTransform: 'capitalize',
            fontWeight: '500',
          }}
        >
          {label}
        </AppText>
      </Animated.View>
    </AnimatedPressable>
  );
}
