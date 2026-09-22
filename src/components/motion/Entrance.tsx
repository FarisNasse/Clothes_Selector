import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOut, ReduceMotion } from 'react-native-reanimated';
import { motion } from '@/design/motion';
import { useExperience } from '@/providers/ExperienceProvider';
export function Entrance({
  children,
  delay = 0,
  style,
}: PropsWithChildren<{ delay?: number; style?: StyleProp<ViewStyle> }>) {
  const { reducedMotion } = useExperience();
  return (
    <Animated.View
      style={style}
      entering={FadeInDown.duration(reducedMotion ? 0 : motion.standard)
        .delay(reducedMotion ? 0 : delay)
        .reduceMotion(ReduceMotion.System)}
      exiting={FadeOut.duration(reducedMotion ? 0 : motion.fast).reduceMotion(ReduceMotion.System)}
    >
      {children}
    </Animated.View>
  );
}
