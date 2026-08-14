import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { semanticColors } from '@/design/colors';
import { typography } from '@/design/typography';

type Variant =
  | 'micro'
  | 'eyebrow'
  | 'metadata'
  | 'bodySmall'
  | 'body'
  | 'bodyLarge'
  | 'heading'
  | 'title'
  | 'display'
  | 'displayXL'
  | 'muted';

type Props = PropsWithChildren<TextProps & { variant?: Variant }>;

export function AppText({ variant = 'body', style, children, ...props }: Props) {
  return (
    <Text {...props} style={[styles.base, styles[variant], style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: { color: semanticColors.ink.primary },
  micro: { fontSize: typography.micro, lineHeight: 13 },
  eyebrow: {
    color: semanticColors.accent.bronze,
    fontSize: typography.metadata,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  metadata: { color: semanticColors.ink.secondary, fontSize: typography.metadata, lineHeight: 16 },
  bodySmall: { fontSize: typography.bodySmall, lineHeight: 19 },
  body: { fontSize: typography.body, lineHeight: 22 },
  bodyLarge: { fontSize: typography.bodyLarge, lineHeight: 25, fontWeight: '600' },
  heading: { fontSize: typography.heading, lineHeight: 28, fontWeight: '700', letterSpacing: -0.3 },
  title: { fontSize: typography.title, lineHeight: 33, fontWeight: '700', letterSpacing: -0.7 },
  display: { fontSize: typography.display, lineHeight: 41, fontWeight: '700', letterSpacing: -1.1 },
  displayXL: { fontSize: typography.displayXL, lineHeight: 48, fontWeight: '700', letterSpacing: -1.4 },
  muted: { color: semanticColors.ink.secondary, fontSize: typography.body, lineHeight: 22 },
});
