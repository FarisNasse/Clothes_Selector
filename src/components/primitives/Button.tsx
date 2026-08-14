import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/primitives/AppText';
import { semanticColors } from '@/design/colors';
import { radius } from '@/design/radii';
import { space } from '@/design/spacing';

type Variant = 'primary' | 'secondary' | 'quiet';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function Button({ label, onPress, variant = 'primary', loading = false, disabled = false, icon }: Props) {
  const foreground = variant === 'primary' ? semanticColors.ink.inverse : semanticColors.ink.primary;
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
        <ActivityIndicator color={foreground} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={17} color={foreground} /> : null}
          <AppText variant="body" style={[styles.label, { color: foreground }]}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingHorizontal: space.xl,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  primary: { backgroundColor: semanticColors.accent.forestDeep },
  secondary: {
    backgroundColor: semanticColors.canvas.elevated,
    borderWidth: 1,
    borderColor: semanticColors.border.strong,
  },
  quiet: { backgroundColor: semanticColors.accent.forestMist },
  label: { fontWeight: '700' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.42 },
});
