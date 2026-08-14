import { semanticColors } from '@/design/colors';
import { motion } from '@/design/motion';
import { radius } from '@/design/radii';
import { space } from '@/design/spacing';
import { typography } from '@/design/typography';

export const theme = {
  colors: semanticColors,
  space,
  radius,
  typography,
  motion,
} as const;
