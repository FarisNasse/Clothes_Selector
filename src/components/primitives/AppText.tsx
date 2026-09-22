import { Platform, Text, type TextProps } from 'react-native';
import { useExperience } from '@/providers/ExperienceProvider';
import { typography } from '@/design/typography';
type Variant = keyof typeof typography | 'eyebrow' | 'muted';
export function AppText({ variant = 'body', style, ...props }: TextProps & { variant?: Variant }) {
  const { colors } = useExperience();
  const size =
    variant === 'eyebrow' ? 11 : variant === 'muted' ? typography.body : typography[variant];
  const editorial = ['display', 'displayXL', 'title'].includes(variant);
  const secondary = ['metadata', 'muted', 'micro'].includes(variant);
  return (
    <Text
      {...props}
      style={[
        {
          color:
            variant === 'eyebrow'
              ? colors.accent.bronze
              : secondary
                ? colors.ink.secondary
                : colors.ink.primary,
          fontSize: size,
          lineHeight: Math.round(size * (editorial ? 1.12 : 1.48)),
          fontFamily: editorial
            ? Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' })
            : undefined,
          fontWeight: variant === 'heading' || variant === 'eyebrow' ? '600' : '400',
          letterSpacing: variant === 'eyebrow' ? 1.8 : editorial ? -1 : 0,
          textTransform: variant === 'eyebrow' ? 'uppercase' : 'none',
        },
        style,
      ]}
    />
  );
}
