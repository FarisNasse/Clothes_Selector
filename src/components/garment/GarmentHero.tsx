import { StyleSheet, View } from 'react-native';

import { GarmentImage } from '@/components/garment/GarmentImage';
import { AppText } from '@/components/primitives/AppText';
import { semanticColors } from '@/design/colors';
import { radius } from '@/design/radii';
import { space } from '@/design/spacing';
import type { Garment } from '@/types/domain';

export function GarmentHero({ garment }: { garment: Garment }) {
  return (
    <View style={styles.root}>
      <GarmentImage garment={garment} variant="hero" showLabel={false} />
      <View style={styles.copy}>
        <View style={styles.kickerRow}>
          <AppText variant="eyebrow">{garment.brand ?? 'Wardrobe piece'}</AppText>
          <View style={styles.wearBadge}>
            <AppText variant="micro" style={styles.wearText}>{garment.wearCount} wears</AppText>
          </View>
        </View>
        <AppText variant="display">{garment.name}</AppText>
        <AppText variant="muted" style={styles.meta}>
          {garment.primaryColor} · {garment.subcategory} · {garment.fit} fit
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.xl },
  copy: { gap: space.sm },
  kickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  wearBadge: { backgroundColor: semanticColors.accent.bronzeMist, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.sm },
  wearText: { color: semanticColors.accent.bronze, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  meta: { textTransform: 'capitalize' },
});
