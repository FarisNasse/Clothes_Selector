import { useState } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { motion } from '@/design/motion';
import { useExperience } from '@/providers/ExperienceProvider';

const MotionPressable = Animated.createAnimatedComponent(Pressable);
type Props = Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle>; feedback?: boolean };
export function AnimatedPressable({
  style,
  feedback = false,
  onPress,
  onPressIn,
  onPressOut,
  onFocus,
  onBlur,
  disabled,
  ...props
}: Props) {
  const { colors, reducedMotion, haptic } = useExperience();
  const scale = useSharedValue(1);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <MotionPressable
      {...props}
      disabled={disabled}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPressIn={(event) => {
        if (!reducedMotion) scale.value = withSpring(0.975, motion.springSnappy);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = reducedMotion ? 1 : withSpring(1, motion.springSoft);
        onPressOut?.(event);
      }}
      onPress={(event) => {
        if (feedback) haptic();
        onPress?.(event);
      }}
      style={[
        style,
        animated,
        hovered && !disabled && { opacity: 0.88 },
        focused && { outlineWidth: 2, outlineColor: colors.accent.forest, outlineOffset: 3 },
      ]}
    />
  );
}
