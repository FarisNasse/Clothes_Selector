import { Pressable, StyleSheet } from 'react-native';

import { Type } from '@/components/Type';
import { colors, radii, spacing } from '@/theme/tokens';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Pill({ label, selected = false, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.root, selected && styles.selected]}>
      <Type style={[styles.label, selected && styles.selectedLabel]}>{label}</Type>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.forest, borderColor: colors.forest },
  label: { fontSize: 14, fontWeight: '600' },
  selectedLabel: { color: colors.white },
});
