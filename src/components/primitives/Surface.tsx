import { View, type ViewProps } from 'react-native';
import { useExperience } from '@/providers/ExperienceProvider';
import { radius } from '@/design/radii';
type Variant = 'canvas' | 'elevated' | 'media' | 'interactive' | 'overlay' | 'sunken';
export function Surface({
  variant = 'elevated',
  style,
  ...props
}: ViewProps & { variant?: Variant }) {
  const { colors: c } = useExperience();
  return (
    <View
      {...props}
      style={[
        {
          borderRadius: variant === 'media' ? radius.media : radius.lg,
          backgroundColor:
            variant === 'canvas'
              ? c.canvas.default
              : variant === 'sunken' || variant === 'media'
                ? c.canvas.sunken
                : c.canvas.elevated,
          borderWidth: variant === 'interactive' ? 1 : 0,
          borderColor: c.border.subtle,
        },
        style,
      ]}
    />
  );
}
