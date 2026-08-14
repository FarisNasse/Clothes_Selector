import { Pressable, StyleSheet, View } from 'react-native';

import { Type } from '@/components/Type';
import { colors, radii, spacing } from '@/theme/tokens';
import type { Garment } from '@/types/domain';

const swatches: Record<string, string> = {
  navy: '#263A55',
  cream: '#E8DFC8',
  white: '#F8F7F2',
  charcoal: '#4A4E4F',
  indigo: '#283E62',
  brown: '#684A37',
  black: '#1D1D1D',
  olive: '#657052',
};

export function GarmentTile({ garment, onPress }: { garment: Garment; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.root, pressed && styles.pressed]}>
      <View
        accessibilityLabel={`${garment.primaryColor} ${garment.subcategory}`}
        style={[styles.visual, { backgroundColor: swatches[garment.primaryColor] ?? '#B9B3A7' }]}
      >
        <Type style={[styles.category, garment.primaryColor === 'black' && styles.lightText]}>
          {garment.subcategory}
        </Type>
      </View>
      <Type style={styles.name} numberOfLines={1}>
        {garment.name}
      </Type>
      <Type variant="muted" style={styles.meta} numberOfLines={1}>
        {garment.brand ?? 'Unbranded'} · {garment.wearCount} wears
      </Type>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { width: '48%', gap: spacing.xs, marginBottom: spacing.lg },
  pressed: { opacity: 0.76 },
  visual: {
    aspectRatio: 0.9,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: 'flex-end',
  },
  category: { fontSize: 13, fontWeight: '700' },
  lightText: { color: colors.white },
  name: { fontWeight: '700', marginTop: spacing.xs },
  meta: { fontSize: 12, lineHeight: 16 },
});
