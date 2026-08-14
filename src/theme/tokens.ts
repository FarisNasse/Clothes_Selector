import { semanticColors } from '@/design/colors';
import { radius } from '@/design/radii';
import { space } from '@/design/spacing';
import { typography } from '@/design/typography';

/**
 * Compatibility facade for the first repository patch.
 * New UI should prefer imports from src/design/*; older screens can migrate incrementally.
 */
export const colors = {
  background: semanticColors.canvas.default,
  surface: semanticColors.canvas.elevated,
  surfaceStrong: semanticColors.canvas.sunken,
  ink: semanticColors.ink.primary,
  muted: semanticColors.ink.secondary,
  border: semanticColors.border.subtle,
  forest: semanticColors.accent.forest,
  forestSoft: semanticColors.accent.forestMist,
  brass: semanticColors.accent.bronze,
  brassSoft: semanticColors.accent.bronzeMist,
  success: semanticColors.feedback.positive,
  danger: semanticColors.feedback.negative,
  white: semanticColors.ink.inverse,
  black: '#111111',
} as const;

export const spacing = {
  xs: space.sm,
  sm: space.md,
  md: space.lg,
  lg: space.xxl,
  xl: space.section,
  xxl: space.sectionLarge,
} as const;

export const radii = {
  sm: radius.sm,
  md: radius.md,
  lg: radius.lg,
  xl: radius.xl,
  media: radius.media,
  pill: radius.pill,
} as const;

export const typeScale = {
  eyebrow: typography.metadata,
  body: typography.body,
  bodyLarge: typography.bodyLarge,
  heading: typography.heading,
  title: typography.title,
  display: typography.display,
  displayXL: typography.displayXL,
} as const;
