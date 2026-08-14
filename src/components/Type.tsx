import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, typeScale } from '@/theme/tokens';

type Variant = 'eyebrow' | 'body' | 'bodyLarge' | 'title' | 'display' | 'muted';

type Props = PropsWithChildren<TextProps & { variant?: Variant }>;

export function Type({ variant = 'body', style, children, ...props }: Props) {
  return (
    <Text {...props} style={[styles.base, styles[variant], style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: { color: colors.ink },
  eyebrow: {
    color: colors.brass,
    fontSize: typeScale.eyebrow,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  body: { fontSize: typeScale.body, lineHeight: 22 },
  bodyLarge: { fontSize: typeScale.bodyLarge, lineHeight: 25, fontWeight: '600' },
  title: { fontSize: typeScale.title, lineHeight: 30, fontWeight: '700', letterSpacing: -0.5 },
  display: { fontSize: typeScale.display, lineHeight: 40, fontWeight: '700', letterSpacing: -1.1 },
  muted: { color: colors.muted, fontSize: typeScale.body, lineHeight: 22 },
});
