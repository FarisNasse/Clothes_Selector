import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { AnimatedPressable } from '@/components/motion/AnimatedPressable';
import { useExperience } from '@/providers/ExperienceProvider';
import { radius } from '@/design/radii';
import { space } from '@/design/spacing';
type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  accessibilityLabel?: string;
};
export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  accessibilityLabel,
}: Props) {
  const { colors: c } = useExperience();
  const foreground =
    variant === 'primary'
      ? c.ink.inverse
      : variant === 'danger'
        ? c.feedback.negative
        : c.ink.primary;
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={{
        minHeight: 52,
        paddingVertical: space.md,
        paddingHorizontal: space.xl,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.45 : 1,
        backgroundColor:
          variant === 'primary'
            ? c.accent.forestDeep
            : variant === 'quiet'
              ? 'transparent'
              : c.canvas.elevated,
        borderWidth: variant === 'secondary' || variant === 'danger' ? 1 : 0,
        borderColor: c.border.strong,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        {loading ? (
          <ActivityIndicator size="small" color={foreground} />
        ) : icon ? (
          <Ionicons name={icon} size={18} color={foreground} />
        ) : null}
        <AppText
          variant="bodySmall"
          style={{ color: foreground, fontWeight: '600', flexShrink: 1 }}
        >
          {label}
        </AppText>
      </View>
    </AnimatedPressable>
  );
}
