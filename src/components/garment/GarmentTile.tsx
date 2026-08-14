import { Pressable, StyleSheet, View } from 'react-native';

import { GarmentImage } from '@/components/garment/GarmentImage';
import { AppText } from '@/components/primitives/AppText';
import { semanticColors } from '@/design/colors';
import { space } from '@/design/spacing';
import type { Garment } from '@/types/domain';

type Props = {
  garment: Garment;
  onPress?: () => void;
  width?: `${number}%` | number;
};

export function GarmentTile({ garment, onPress, width = '31.5%' }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${garment.name}. ${garment.brand ?? 'Unbranded'}. Worn ${garment.wearCount} times. Double tap to view.`}
      onPress={onPress}
      style={({ pressed }) => [styles.root, { width }, pressed && styles.pressed]}
    >
      <GarmentImage garment={garment} variant="grid" />
      <View style={styles.copy}>
        <AppText variant="bodySmall" style={styles.brand} numberOfLines={1}>
          {garment.brand ?? 'Unbranded'}
        </AppText>
        <AppText variant="metadata" numberOfLines={1}>{garment.name}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.sm, marginBottom: space.xl },
  pressed: { opacity: 0.78 },
  copy: { gap: 1, paddingHorizontal: 2 },
  brand: { color: semanticColors.ink.primary, fontWeight: '700' },
});
