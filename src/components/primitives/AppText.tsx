import { Text, type TextProps } from 'react-native';
import { useExperience } from '@/providers/ExperienceProvider';
import { fontFamily, typography } from '@/design/typography';
type Variant = keyof typeof typography | 'eyebrow' | 'muted';
export function AppText({ variant = 'body', style, ...props }: TextProps & { variant?: Variant }) {
  const { colors } = useExperience();
  const size =
    variant === 'eyebrow' ? 11 : variant === 'muted' ? typography.body : typography[variant];
  const editorial = ['displayHero', 'displayXXL', 'display', 'displayXL', 'title'].includes(variant);
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
          lineHeight: Math.round(size * (editorial ? 1.13 : 1.46)),
          fontFamily: editorial ? fontFamily.editorial :
            variant === 'heading' || variant === 'eyebrow' ? fontFamily.functionalBold : fontFamily.functional,
          letterSpacing: variant === 'eyebrow' ? 1.7 : editorial ? -1.2 : 0,
          textTransform: variant === 'eyebrow' ? 'uppercase' : 'none',
        },
        style,
      ]}
    />
  );
}
