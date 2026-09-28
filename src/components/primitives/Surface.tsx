import { View, type ViewProps } from 'react-native';
import { useExperience } from '@/providers/ExperienceProvider';
import { radius } from '@/design/radii';
type Variant = 'canvas' | 'elevated' | 'media' | 'interactive' | 'overlay' | 'sunken' | 'editorial' | 'inverse' | 'floating' | 'selected';
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
            variant === 'canvas' ? c.canvas.default :
            variant === 'media' ? c.canvas.media :
            variant === 'sunken' ? c.canvas.sunken :
            variant === 'editorial' ? c.canvas.editorial :
            variant === 'inverse' ? c.canvas.inverse :
            variant === 'floating' || variant === 'overlay' ? c.canvas.floating :
            variant === 'selected' ? c.canvas.selected : c.canvas.elevated,
          borderWidth: variant === 'interactive' || variant === 'floating' ? 1 : 0,
          borderColor: c.border.subtle,
          ...(variant === 'floating' ? { shadowColor: '#111A14', shadowOpacity: 0.11, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 5 } : {}),
        },
        style,
      ]}
    />
  );
}
