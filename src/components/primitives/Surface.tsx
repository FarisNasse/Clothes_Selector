import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { semanticColors } from '@/design/colors';
import { radius } from '@/design/radii';

type Variant = 'canvas' | 'elevated' | 'media' | 'interactive' | 'overlay' | 'sunken';

type Props = PropsWithChildren<ViewProps & { variant?: Variant }>;

export function Surface({ variant = 'elevated', style, children, ...props }: Props) {
  return (
    <View {...props} style={[styles.base, styles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg },
  canvas: { backgroundColor: semanticColors.canvas.default },
  elevated: { backgroundColor: semanticColors.canvas.elevated },
  media: { backgroundColor: semanticColors.canvas.sunken, borderRadius: radius.media },
  interactive: {
    backgroundColor: semanticColors.canvas.elevated,
    borderWidth: 1,
    borderColor: semanticColors.border.subtle,
  },
  overlay: { backgroundColor: semanticColors.canvas.elevated, borderRadius: radius.xl },
  sunken: { backgroundColor: semanticColors.canvas.sunken },
});
