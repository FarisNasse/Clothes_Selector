import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { Type } from '@/components/Type';
import { colors, radii, spacing } from '@/theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'quiet';
  loading?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.forest} />
      ) : (
        <Type style={[styles.label, variant === 'primary' && styles.primaryLabel]}>{label}</Type>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
  },
  primary: { backgroundColor: colors.forest },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  quiet: { backgroundColor: colors.forestSoft },
  label: { fontWeight: '700' },
  primaryLabel: { color: colors.white },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.45 },
});
