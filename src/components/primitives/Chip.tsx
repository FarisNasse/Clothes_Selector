import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/primitives/AppText';
import { semanticColors } from '@/design/colors';
import { radius } from '@/design/radii';
import { space } from '@/design/spacing';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Chip({ label, selected = false, onPress, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => [styles.root, selected && styles.selected, pressed && styles.pressed]}
    >
      <AppText variant="bodySmall" style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: semanticColors.border.subtle,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    backgroundColor: semanticColors.canvas.elevated,
  },
  selected: { backgroundColor: semanticColors.accent.forest, borderColor: semanticColors.accent.forest },
  pressed: { opacity: 0.75 },
  label: { fontWeight: '600' },
  selectedLabel: { color: semanticColors.ink.inverse },
});
